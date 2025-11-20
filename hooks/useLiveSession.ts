import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, FunctionDeclaration, Type } from '@google/genai';
import { floatTo16BitPCM, pcm16ToFloat32, base64ToArrayBuffer, arrayBufferToBase64 } from '../utils/audioUtils';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025';
const AUDIO_SAMPLE_RATE = 24000; // Model output rate
const INPUT_SAMPLE_RATE = 16000; // Model input expectation

// --- Tool Definitions ---

const navigationTool: FunctionDeclaration = {
  name: 'navigate',
  description: 'Navigate the user to a specific screen in the application. Use this when the user asks to go somewhere or see something specific.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      screen: {
        type: Type.STRING,
        description: 'The screen to navigate to. Options: "companion" (home), "feed", "updates", "productivity", "automation"',
        enum: ['companion', 'feed', 'updates', 'productivity', 'automation']
      }
    },
    required: ['screen']
  }
};

const addTaskTool: FunctionDeclaration = {
  name: 'addTask',
  description: 'Create a new task in the users productivity list. Ask for the task title if not provided.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'The content or title of the task to be done.'
      },
      category: {
        type: Type.STRING,
        description: 'The category of the task (e.g., Work, Personal, Health, Study). Defaults to General.',
      }
    },
    required: ['title']
  }
};

const manageTaskTool: FunctionDeclaration = {
  name: 'manageTask',
  description: 'Update, complete, or delete an existing task. Use this when the user wants to modify the state of a task.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        enum: ['complete', 'delete'],
        description: 'The action to perform: "complete" to toggle status (mark done/undone), "delete" to remove.'
      },
      searchPhrase: {
        type: Type.STRING,
        description: 'The phrase to identify the task (e.g. "grocery", "gym").'
      }
    },
    required: ['action', 'searchPhrase']
  }
};

const getTasksTool: FunctionDeclaration = {
  name: 'getTasks',
  description: 'Get the current list of tasks. Use this when the user asks "what do I have to do?" or "read my tasks".',
  parameters: {
    type: Type.OBJECT,
    properties: {}, // No args needed
  }
};

const changeVoiceTool: FunctionDeclaration = {
  name: 'changeVoice',
  description: 'Change the voice of the AI companion. Use this when the user asks to change the voice (e.g., "be female", "deeper voice").',
  parameters: {
    type: Type.OBJECT,
    properties: {
      voiceName: {
        type: Type.STRING,
        description: 'The voice to switch to. Options: "Puck" (Male), "Charon" (Deep Male), "Kore" (Female), "Fenrir" (Energetic Male), "Zephyr" (Calm Female).',
        enum: ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr']
      }
    },
    required: ['voiceName']
  }
};

export const useLiveSession = (isActive: boolean) => {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [volume, setVolume] = useState(0);
  
  const { preferences, addTask, tasks, toggleTask, deleteTask, updatePreferences } = useApp();
  const navigate = useNavigate();

  // Use refs to hold latest state/handlers to avoid reconnecting when they change
  const handlersRef = useRef({ addTask, navigate, tasks, toggleTask, deleteTask, updatePreferences });
  
  useEffect(() => {
    handlersRef.current = { addTask, navigate, tasks, toggleTask, deleteTask, updatePreferences };
  }, [addTask, navigate, tasks, toggleTask, deleteTask, updatePreferences]);

  // Refs for audio contexts and session to persist across renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Stable disconnect function
  const disconnect = useCallback(() => {
    if (sessionRef.current) {
        sessionRef.current = null;
    }

    if (sourceRef.current) {
      try { sourceRef.current.disconnect(); } catch(e) {}
      sourceRef.current = null;
    }

    if (scriptProcessorRef.current) {
      try { scriptProcessorRef.current.disconnect(); } catch(e) {}
      scriptProcessorRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    
    if (inputContextRef.current) {
      inputContextRef.current.close().catch(console.error);
      inputContextRef.current = null;
    }
    
    setStatus('disconnected');
    setVolume(0);
    nextStartTimeRef.current = 0;
  }, []);

  // Connection effect - runs when isActive changes OR when voice preference changes
  useEffect(() => {
    if (!isActive) {
      disconnect();
      return;
    }

    let isMounted = true;

    const connect = async () => {
      if (!process.env.API_KEY) {
        console.error("No API Key");
        setStatus('error');
        return;
      }

      try {
        setStatus('connecting');

        // Initialize Audio Contexts
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        
        const audioCtx = new AudioContextClass({ sampleRate: AUDIO_SAMPLE_RATE });
        const inputCtx = new AudioContextClass({ sampleRate: INPUT_SAMPLE_RATE });
        
        await Promise.all([audioCtx.resume(), inputCtx.resume()]);
        
        audioContextRef.current = audioCtx;
        inputContextRef.current = inputCtx;

        // Get Microphone Stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Initialize Gemini Client
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // Capture current preferences at connection time
        const currentPrefs = preferences; 

        const sessionPromise = ai.live.connect({
          model: MODEL,
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: currentPrefs.voiceName } }
            },
            systemInstruction: currentPrefs.systemInstruction,
            tools: [
              { functionDeclarations: [
                  navigationTool, 
                  addTaskTool, 
                  manageTaskTool, 
                  getTasksTool,
                  changeVoiceTool 
                ] 
              }
            ]
          },
          callbacks: {
              onopen: () => {
                  if (!isMounted) return;
                  console.log("Live API Connected");
                  setStatus('connected');
                  if (audioContextRef.current) {
                      nextStartTimeRef.current = audioContextRef.current.currentTime;
                  }
              },
              onmessage: async (message: LiveServerMessage) => {
                  if (!isMounted) return;

                  // Handle Tool Calls
                  if (message.toolCall) {
                    const responses = [];
                    const { navigate, addTask, tasks, toggleTask, deleteTask, updatePreferences } = handlersRef.current;

                    for (const fc of message.toolCall.functionCalls) {
                      let result: any = { result: "ok" };
                      
                      try {
                        if (fc.name === 'navigate') {
                           const screen = (fc.args as any).screen;
                           const path = screen === 'companion' ? '/' : `/${screen}`;
                           navigate(path);
                           result = { result: `Navigated to ${screen}` };
                        } 
                        else if (fc.name === 'addTask') {
                           const { title, category } = fc.args as any;
                           addTask(title, category || "General");
                           navigate('/productivity');
                           result = { result: `Added task "${title}" to category ${category || "General"}` };
                        }
                        else if (fc.name === 'getTasks') {
                           const taskList = tasks.map(t => `${t.text} (${t.completed ? 'Done' : 'Pending'})`).join(', ');
                           result = { result: taskList || "No tasks currently." };
                        }
                        else if (fc.name === 'manageTask') {
                           const { action, searchPhrase } = fc.args as any;
                           // Fuzzy find task
                           const task = tasks.find(t => t.text.toLowerCase().includes(searchPhrase.toLowerCase()));
                           
                           if (task) {
                             if (action === 'complete') {
                               toggleTask(task.id);
                               result = { result: `Task "${task.text}" marked as ${!task.completed ? 'Complete' : 'Incomplete'}` };
                             } else if (action === 'delete') {
                               deleteTask(task.id);
                               result = { result: `Task "${task.text}" deleted` };
                             }
                           } else {
                             result = { result: `Error: Could not find task matching "${searchPhrase}"` };
                           }
                           // Refresh view
                           navigate('/productivity');
                        }
                        else if (fc.name === 'changeVoice') {
                           const { voiceName } = fc.args as any;
                           updatePreferences({ voiceName: voiceName as any });
                           result = { result: `Voice changed to ${voiceName}. Reconnecting...` };
                        }
                      } catch (err: any) {
                        result = { error: err.message };
                      }

                      responses.push({
                        id: fc.id,
                        name: fc.name,
                        response: result
                      });
                    }
                    
                    sessionPromise.then(session => {
                       session.sendToolResponse({ functionResponses: responses });
                    });
                  }

                  // Handle Audio Output
                  const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                  if (base64Audio && audioContextRef.current) {
                      const audioData = base64ToArrayBuffer(base64Audio);
                      const float32Data = pcm16ToFloat32(audioData);
                      
                      const buffer = audioContextRef.current.createBuffer(1, float32Data.length, AUDIO_SAMPLE_RATE);
                      buffer.getChannelData(0).set(float32Data);

                      const source = audioContextRef.current.createBufferSource();
                      source.buffer = buffer;
                      source.connect(audioContextRef.current.destination);
                      
                      // Simple volume analysis
                      const data = buffer.getChannelData(0);
                      let sum = 0;
                      for(let i=0; i<data.length; i+=50) sum += Math.abs(data[i]);
                      const avg = sum / (data.length/50);
                      setVolume(Math.min(avg * 2000, 100));

                      const currentTime = audioContextRef.current.currentTime;
                      const startTime = Math.max(currentTime, nextStartTimeRef.current);
                      
                      source.start(startTime);
                      nextStartTimeRef.current = startTime + buffer.duration;
                  }
              },
              onclose: () => {
                  if (!isMounted) return;
                  console.log("Live API Closed");
                  // Only set disconnected if we aren't actively switching voices/reconnecting
                  // But for now, let's just set it. The effect will re-trigger for voice change.
                  setStatus('disconnected');
              },
              onerror: (err) => {
                  if (!isMounted) return;
                  console.error("Live API Error", err);
                  setStatus('error');
                  disconnect(); 
              }
          }
        });

        sessionRef.current = sessionPromise;

        // Setup Audio Input Processor
        const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
        scriptProcessorRef.current = processor;
        
        const source = inputContextRef.current.createMediaStreamSource(stream);
        sourceRef.current = source;

        processor.onaudioprocess = (e) => {
          if (!sessionRef.current) return;

          const inputData = e.inputBuffer.getChannelData(0);
          
          // Input volume visualization
          let sum = 0;
          for(let i=0; i<inputData.length; i+=50) sum += Math.abs(inputData[i]);
          const avg = sum / (inputData.length/50);
          if (avg > 0.005) setVolume(Math.min(avg * 2000, 100));

          const pcm16 = floatTo16BitPCM(inputData);
          const base64Data = arrayBufferToBase64(pcm16);

          sessionPromise.then(session => {
              session.sendRealtimeInput({
                  media: {
                      mimeType: 'audio/pcm;rate=16000',
                      data: base64Data
                  }
              });
          }).catch(e => {
              console.error("Failed to send input", e);
          });
        };

        source.connect(processor);
        processor.connect(inputContextRef.current.destination);

      } catch (error) {
        console.error("Connection setup failed", error);
        setStatus('error');
        disconnect();
      }
    };

    connect();

    return () => {
      isMounted = false;
      disconnect();
    };
  }, [isActive, disconnect, preferences.voiceName]); 

  return { status, volume };
};