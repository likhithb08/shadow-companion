
import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { floatTo16BitPCM, pcm16ToFloat32, base64ToArrayBuffer, arrayBufferToBase64 } from '../utils/audioUtils';
import { useApp } from '../context/AppContext';
import { useGeminiTools } from './useGeminiTools';

const MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';
const AUDIO_SAMPLE_RATE = 24000; // Model output rate
const INPUT_SAMPLE_RATE = 16000; // Model input expectation

export const useLiveSession = (isActive: boolean) => {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [volume, setVolume] = useState(0);
  
  const { preferences } = useApp();
  const { tools, handleToolCall } = useGeminiTools();

  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const isMountedRef = useRef(true);
  const isConnectedRef = useRef(false);
  
  const handleToolCallRef = useRef(handleToolCall);
  useEffect(() => { handleToolCallRef.current = handleToolCall; }, [handleToolCall]);

  const cleanup = useCallback(() => {
    isConnectedRef.current = false;
    
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

    if (sessionRef.current) {
       const currentSession = sessionRef.current;
       currentSession.then(session => {
          try { session.close(); } catch(e) {}
       }).catch(() => {});
       sessionRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (inputContextRef.current && inputContextRef.current.state !== 'closed') {
      inputContextRef.current.close().catch(() => {});
      inputContextRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (!isActive) {
      cleanup();
      setStatus('disconnected');
      setVolume(0);
      nextStartTimeRef.current = 0;
      return;
    }

    const connect = async () => {
      if (!process.env.API_KEY) {
        if (isMountedRef.current) setStatus('error');
        return;
      }

      try {
        if (isMountedRef.current) setStatus('connecting');

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass({ sampleRate: AUDIO_SAMPLE_RATE });
        const inputCtx = new AudioContextClass({ sampleRate: INPUT_SAMPLE_RATE });
        
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        if (inputCtx.state === 'suspended') await inputCtx.resume();
        
        if (!isMountedRef.current || !isActive) {
          audioCtx.close();
          inputCtx.close();
          return;
        }

        audioContextRef.current = audioCtx;
        inputContextRef.current = inputCtx;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: {
          channelCount: 1,
          sampleRate: INPUT_SAMPLE_RATE,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }});
        streamRef.current = stream;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const currentPrefs = preferences; 

        const sessionPromise = ai.live.connect({
          model: MODEL,
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: currentPrefs.voiceName } }
            },
            systemInstruction: currentPrefs.systemInstruction,
            tools: [{ functionDeclarations: tools }],
          },
          callbacks: {
              onopen: () => {
                  if (!isMountedRef.current) return;
                  isConnectedRef.current = true;
                  setStatus('connected');
                  
                  if (audioContextRef.current) {
                      nextStartTimeRef.current = audioContextRef.current.currentTime;
                  }

                  setupAudioInput(sessionPromise);
              },
              onmessage: async (message: LiveServerMessage) => {
                  if (!isMountedRef.current) return;

                  if (message.toolCall) {
                    const responses = [];
                    for (const fc of message.toolCall.functionCalls) {
                      let result;
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
                        
                        let sum = 0;
                        for(let i=0; i<float32Data.length; i++) sum += Math.abs(float32Data[i]);
                        setVolume(Math.min((sum / float32Data.length) * 1000, 100));

                        const startTime = Math.max(audioContextRef.current.currentTime, nextStartTimeRef.current);
                        source.start(startTime);
                        nextStartTimeRef.current = startTime + buffer.duration;
                      } catch (e) {}
                  }
              },
              onclose: () => {
                  if (!isMountedRef.current) return;
                  isConnectedRef.current = false;
                  setStatus('disconnected');
              },
              onerror: (err) => {
                  if (!isMountedRef.current) return;
                  if (!isConnectedRef.current) setStatus('error');
              }
          }
        });

        sessionRef.current = sessionPromise;

      } catch (error) {
        if (isMountedRef.current) {
          setStatus('error');
          cleanup();
        }
      }
    };

    const setupAudioInput = (currentPromise: Promise<any>) => {
        if (!inputContextRef.current || !streamRef.current) return;

        const processor = inputContextRef.current.createScriptProcessor(2048, 1, 1);
        scriptProcessorRef.current = processor;
        const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
        sourceRef.current = source;

        processor.onaudioprocess = (e) => {
          if (!isConnectedRef.current) return;
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm16 = floatTo16BitPCM(inputData);
          const base64Data = arrayBufferToBase64(pcm16);

          currentPromise.then(session => {
              try {
                  session.sendRealtimeInput({
                      media: {
                          mimeType: 'audio/pcm;rate=16000',
                          data: base64Data
                      }
                  });
              } catch(e) {}
          }).catch(() => {});
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
