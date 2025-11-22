
import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { floatTo16BitPCM, pcm16ToFloat32, base64ToArrayBuffer, arrayBufferToBase64 } from '../utils/audioUtils';
import { useApp } from '../context/AppContext';
import { useGeminiTools } from './useGeminiTools';

const MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025';
const AUDIO_SAMPLE_RATE = 24000; // Model output rate
const INPUT_SAMPLE_RATE = 16000; // Model input expectation

export const useLiveSession = (isActive: boolean) => {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [volume, setVolume] = useState(0);
  
  const { preferences } = useApp();
  const { tools, handleToolCall } = useGeminiTools();

  // Refs for audio contexts and session to persist across renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Track if the hook is mounted to prevent state updates on unmounted components
  const isMountedRef = useRef(true);
  
  // Track actual connection state to prevent sending data too early
  const isConnectedRef = useRef(false);
  
  // Keep tool handler fresh
  const handleToolCallRef = useRef(handleToolCall);
  useEffect(() => { handleToolCallRef.current = handleToolCall; }, [handleToolCall]);

  // Cleanup function
  const cleanup = useCallback(() => {
    isConnectedRef.current = false;
    
    // 1. Stop Processor immediately to stop data flow
    if (scriptProcessorRef.current) {
      try { 
        scriptProcessorRef.current.disconnect(); 
        scriptProcessorRef.current.onaudioprocess = null;
      } catch(e) {}
      scriptProcessorRef.current = null;
    }
    
    if (sourceRef.current) {
      try { sourceRef.current.disconnect(); } catch(e) {}
      sourceRef.current = null;
    }

    // 2. Close Session
    if (sessionRef.current) {
       const currentSession = sessionRef.current;
       currentSession.then(session => {
          try { session.close(); } catch(e) { console.warn("Error closing session", e); }
       }).catch(() => {
          // Ignore errors if session never connected
       });
       sessionRef.current = null;
    }

    // 3. Stop Media Stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // 4. Close Audio Contexts
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (inputContextRef.current && inputContextRef.current.state !== 'closed') {
      inputContextRef.current.close().catch(() => {});
      inputContextRef.current = null;
    }
  }, []);

  // Main Effect
  useEffect(() => {
    isMountedRef.current = true;

    if (!isActive) {
      cleanup();
      setStatus('disconnected');
      setVolume(0);
      nextStartTimeRef.current = 0;
      return;
    }

    let currentSessionPromise: Promise<any> | null = null;

    const connect = async () => {
      if (!process.env.API_KEY) {
        console.error("No API Key");
        if (isMountedRef.current) setStatus('error');
        return;
      }

      try {
        if (isMountedRef.current) setStatus('connecting');

        // 1. Initialize Audio Contexts
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass({ sampleRate: AUDIO_SAMPLE_RATE });
        const inputCtx = new AudioContextClass({ sampleRate: INPUT_SAMPLE_RATE });
        
        // Ensure contexts are ready and resumed (browser policy)
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        if (inputCtx.state === 'suspended') await inputCtx.resume();
        
        if (!isMountedRef.current || !isActive) {
          audioCtx.close();
          inputCtx.close();
          return;
        }

        audioContextRef.current = audioCtx;
        inputContextRef.current = inputCtx;

        // 2. Get Microphone Access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: {
          channelCount: 1,
          sampleRate: INPUT_SAMPLE_RATE,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }});
        streamRef.current = stream;

        // 3. Initialize Gemini Session
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const currentPrefs = preferences; 

        // Define session promise first
        const sessionPromise = ai.live.connect({
          model: MODEL,
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: currentPrefs.voiceName } }
            },
            systemInstruction: currentPrefs.systemInstruction,
            tools: [{ functionDeclarations: tools }],
            thinkingConfig: { thinkingBudget: 0 } // Speed optimization
          },
          callbacks: {
              onopen: () => {
                  if (!isMountedRef.current || sessionRef.current !== sessionPromise) return;
                  console.log("Live API Connected");
                  isConnectedRef.current = true;
                  setStatus('connected');
                  
                  if (audioContextRef.current) {
                      nextStartTimeRef.current = audioContextRef.current.currentTime;
                  }

                  // Only start audio input logic AFTER the session is open
                  try {
                    setupAudioInput(sessionPromise);
                  } catch (e) {
                    console.error("Failed to setup audio input", e);
                    setStatus('error');
                  }
              },
              onmessage: async (message: LiveServerMessage) => {
                  if (!isMountedRef.current || sessionRef.current !== sessionPromise) return;

                  // Handle Tool Calls
                  if (message.toolCall) {
                    const responses = [];
                    for (const fc of message.toolCall.functionCalls) {
                      let result: any = { result: "ok" };
                      try {
                        result = await handleToolCallRef.current(fc.name, fc.args);
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
                      try {
                        const audioData = base64ToArrayBuffer(base64Audio);
                        const float32Data = pcm16ToFloat32(audioData);
                        
                        const buffer = audioContextRef.current.createBuffer(1, float32Data.length, AUDIO_SAMPLE_RATE);
                        buffer.getChannelData(0).set(float32Data);

                        const source = audioContextRef.current.createBufferSource();
                        source.buffer = buffer;
                        source.connect(audioContextRef.current.destination);
                        
                        // Calculate volume for visualizer
                        const data = buffer.getChannelData(0);
                        let sum = 0;
                        const step = Math.floor(data.length / 50) || 1;
                        for(let i=0; i<data.length; i+=step) sum += Math.abs(data[i]);
                        const avg = sum / (data.length/step);
                        setVolume(Math.min(avg * 2000, 100));

                        const currentTime = audioContextRef.current.currentTime;
                        // Ensure next start time is at least current time to prevent glitches
                        const startTime = Math.max(currentTime, nextStartTimeRef.current);
                        
                        source.start(startTime);
                        nextStartTimeRef.current = startTime + buffer.duration;
                      } catch (e) {
                        console.error("Audio processing error", e);
                      }
                  }
              },
              onclose: () => {
                  if (!isMountedRef.current || sessionRef.current !== sessionPromise) return;
                  console.log("Live API Closed");
                  isConnectedRef.current = false;
                  setStatus('disconnected');
              },
              onerror: (err) => {
                  if (!isMountedRef.current || sessionRef.current !== sessionPromise) return;
                  console.error("Live API Error", err);
                  if (!isConnectedRef.current) setStatus('error');
              }
          }
        });

        // Catch connection errors immediately
        sessionPromise.catch(err => {
            console.warn("Session connection failed", err);
            if (isMountedRef.current && sessionRef.current === sessionPromise) {
                setStatus('error');
            }
        });

        currentSessionPromise = sessionPromise;
        sessionRef.current = sessionPromise;

      } catch (error) {
        console.error("Connection setup failed", error);
        if (isMountedRef.current) {
          setStatus('error');
          cleanup();
        }
      }
    };

    // Helper to setup audio input (called only on open)
    const setupAudioInput = (currentPromise: Promise<any>) => {
        if (!inputContextRef.current || !streamRef.current) return;

        // Use 2048 buffer for lower latency
        const processor = inputContextRef.current.createScriptProcessor(2048, 1, 1);
        scriptProcessorRef.current = processor;
        
        const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
        sourceRef.current = source;

        processor.onaudioprocess = (e) => {
          // Strictly check connection state
          if (!isConnectedRef.current || !sessionRef.current || sessionRef.current !== currentPromise) return;

          const inputData = e.inputBuffer.getChannelData(0);
          
          // Volume visualization logic
          let sum = 0;
          const step = Math.floor(inputData.length / 50) || 1;
          for(let i=0; i<inputData.length; i+=step) sum += Math.abs(inputData[i]);
          const avg = sum / (inputData.length/step);
          if (avg > 0.01) setVolume(Math.min(avg * 2000, 100));

          // Convert and Send
          const pcm16 = floatTo16BitPCM(inputData);
          const base64Data = arrayBufferToBase64(pcm16);

          // Use promise to send, but catch errors to prevent crashes
          currentPromise.then(session => {
              try {
                  session.sendRealtimeInput({
                      media: {
                          mimeType: 'audio/pcm;rate=16000',
                          data: base64Data
                      }
                  });
              } catch(e) {
                  // This can happen if socket closes mid-frame. Safe to ignore.
              }
          }).catch(() => {
            // Ignore session promise rejection here, handled elsewhere
          });
        };

        source.connect(processor);
        processor.connect(inputContextRef.current.destination);
    };

    connect();

    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [isActive, cleanup, preferences.voiceName, tools, preferences.systemInstruction]);

  return { status, volume };
};
