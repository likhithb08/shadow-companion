
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, User, Sparkles, Settings as SettingsIcon, Terminal, Cpu, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import { runChatTurn } from '../services/gemini';
import { useGeminiTools } from '../hooks/useGeminiTools';
import { Content } from '@google/genai';

export const Companion: React.FC = () => {
  const { isVoiceActive, setVoiceActive, preferences, updatePreferences } = useApp();
  const { tools, handleToolCall } = useGeminiTools();
  
  // Text Chat State
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { 
      id: 'init', 
      role: 'model', 
      text: "System Initialized. Shadow AI online. Awaiting input...", 
      timestamp: Date.now() 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);

  const voices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  // --- Listen for System Messages (Behavior Nudges / Focus Summaries) ---
  useEffect(() => {
    const handleSystemMessage = (event: CustomEvent<string>) => {
      const text = event.detail;
      const sysMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: text,
        timestamp: Date.now(),
        isSystemNudge: true
      };
      
      setChatHistory(prev => [...prev, sysMsg]);
      
      // Auto-speak system messages if enabled (even if not voice active, for alerts)
      if (preferences.autoSpeak) {
        speak(text);
      }
    };

    window.addEventListener('shadow-system-message', handleSystemMessage as EventListener);
    return () => {
      window.removeEventListener('shadow-system-message', handleSystemMessage as EventListener);
    };
  }, [preferences.autoSpeak]);

  // --- Text-to-Speech Logic ---
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to pick a voice that matches the persona loosely (Cyberpunk-ish)
      const sysVoices = window.speechSynthesis.getVoices();
      // Prefer a Google voice or generic English
      const preferredVoice = sysVoices.find(v => v.name.includes('Google US English')) || sysVoices.find(v => v.lang === 'en-US');
      if (preferredVoice) utterance.voice = preferredVoice;

      // Pitch/Rate adjustments for "Robotic/AI" feel
      utterance.rate = 1.05; 
      utterance.pitch = 0.95;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Initialize voices
  useEffect(() => {
      if ('speechSynthesis' in window) {
          window.speechSynthesis.getVoices(); // Warm up
      }
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Convert simple chat history to Gemini Content format
      const historyContent: Content[] = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const responseText = await runChatTurn(historyContent, userMsg.text, tools, handleToolCall);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setChatHistory(prev => [...prev, aiMsg]);
      
      if (preferences.autoSpeak && !isVoiceActive) {
          speak(responseText);
      }

    } catch (error) {
      console.error("Chat failed", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Err: Processing failed. Check console for diagnostics.",
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (showSettings) {
    return (
        <div className="max-w-2xl mx-auto p-4 relative">
             {/* Settings Header with Decor */}
             <div className="flex items-center justify-between mb-8 relative border-b border-shadow-800 pb-4">
                <div className="flex items-center gap-2 text-accent-400">
                   <SettingsIcon size={24} className="animate-spin-slow" />
                   <h2 className="text-2xl font-bold tracking-widest uppercase">Configuration</h2>
                </div>
                <button onClick={() => setShowSettings(false)} className="text-sm text-shadow-400 hover:text-accent-400 uppercase tracking-wider border border-shadow-700 px-4 py-1 rounded hover:bg-shadow-800 transition-colors">
                    [ ESC ] Return
                </button>
             </div>
             
            <div className="space-y-6 relative z-10">
                <div className="clip-hud bg-shadow-900/60 border border-shadow-700 p-6 backdrop-blur-sm relative">
                     {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-accent-500/50" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-accent-500/50" />
                    
                    <div className="flex items-center gap-2 mb-4 text-accent-300 border-b border-shadow-800 pb-2">
                        <User size={18} />
                        <h3 className="font-bold uppercase tracking-wider text-sm">User Identity</h3>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] text-shadow-500 uppercase font-bold mb-2 tracking-widest">Designation Name</label>
                            <input 
                                type="text" 
                                value={preferences.userName}
                                onChange={(e) => updatePreferences({ userName: e.target.value })}
                                className="w-full bg-black/50 border border-shadow-700 rounded-sm px-4 py-3 text-shadow-100 focus:border-accent-600 outline-none font-mono"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] text-shadow-500 uppercase font-bold tracking-widest">Vocal Synthesis Model</label>
                                <button 
                                    onClick={() => updatePreferences({ autoSpeak: !preferences.autoSpeak })}
                                    className={`text-[10px] uppercase font-bold px-2 py-1 border rounded transition-all flex items-center gap-2 ${
                                        preferences.autoSpeak 
                                        ? 'border-accent-500 text-accent-400 bg-accent-900/20' 
                                        : 'border-shadow-700 text-shadow-500'
                                    }`}
                                >
                                    {preferences.autoSpeak ? <Volume2 size={12} /> : <VolumeX size={12} />}
                                    Auto-Vocalize: {preferences.autoSpeak ? 'ON' : 'OFF'}
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {voices.map(voice => (
                                    <button
                                        key={voice}
                                        onClick={() => updatePreferences({ voiceName: voice as any })}
                                        className={`px-3 py-3 text-xs font-mono uppercase transition-all relative overflow-hidden group ${
                                            preferences.voiceName === voice 
                                            ? 'bg-accent-600/20 border border-accent-500 text-accent-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                                            : 'bg-shadow-950 border border-shadow-800 text-shadow-500 hover:border-shadow-600'
                                        }`}
                                    >
                                        {preferences.voiceName === voice && (
                                            <div className="absolute top-0 left-0 w-full h-[2px] bg-accent-400 animate-pulse" />
                                        )}
                                        {voice}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="clip-hud bg-shadow-900/60 border border-shadow-700 p-6 backdrop-blur-sm relative">
                    <div className="flex items-center gap-2 mb-4 text-accent-300 border-b border-shadow-800 pb-2">
                        <Terminal size={18} />
                        <h3 className="font-bold uppercase tracking-wider text-sm">Core Directives</h3>
                    </div>
                    <textarea 
                        value={preferences.systemInstruction}
                        onChange={(e) => updatePreferences({ systemInstruction: e.target.value })}
                        className="w-full h-40 bg-black/50 border border-shadow-700 rounded-sm px-4 py-3 text-xs font-mono text-shadow-200 focus:border-accent-600 outline-none resize-none leading-relaxed"
                    />
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-2rem)] max-w-5xl mx-auto relative">
      
      {/* Header HUD */}
      <div className="flex items-center justify-between py-4 px-4 border-b border-shadow-800 mb-4 bg-shadow-900/30 clip-corner-tr">
         <div className="flex items-center gap-4">
            <div className="relative">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white border border-shadow-700 bg-black/50 ${isVoiceActive ? 'shadow-[0_0_15px_rgba(239,68,68,0.5)] border-red-900' : 'shadow-[0_0_15px_rgba(6,182,212,0.2)] border-cyan-900'}`}>
                    <Cpu size={20} className={isVoiceActive ? 'animate-pulse text-red-400' : 'text-cyan-400'} />
                </div>
                {isVoiceActive && <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>}
            </div>
            <div>
                <h2 className="font-bold text-lg tracking-wider text-white">SHADOW<span className="text-accent-500">.AI</span></h2>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
                    <span className="text-shadow-500">Status:</span>
                    <span className={isVoiceActive ? 'text-red-400 animate-pulse' : 'text-cyan-400'}>
                        {isVoiceActive ? 'VOICE UPLINK ESTABLISHED' : 'TEXT TERMINAL READY'}
                    </span>
                </div>
            </div>
         </div>
         <button onClick={() => setShowSettings(true)} className="group p-2 border border-transparent hover:border-shadow-600 hover:bg-shadow-800 rounded transition-all">
             <SettingsIcon size={20} className="text-shadow-400 group-hover:text-accent-400 group-hover:rotate-90 transition-transform duration-500" />
         </button>
      </div>

      {/* Messages Area (Terminal Style) */}
      <div className="flex-1 overflow-y-auto px-2 space-y-6 pb-4 font-mono custom-scrollbar">
         {chatHistory.map((msg) => (
             <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                 <div className={`max-w-[85%] relative group ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                     {/* Name Tag */}
                     <div className={`text-[10px] mb-1 uppercase tracking-widest opacity-50 ${msg.role === 'user' ? 'text-right text-accent-400' : 'text-left text-cyan-400'}`}>
                         {msg.role === 'user' ? 'OPERATOR' : (msg.isSystemNudge ? 'SYSTEM ALERT' : 'SHADOW UNIT')}
                     </div>
                     
                     {/* Message Box */}
                     <div className={`px-6 py-4 text-sm leading-relaxed border backdrop-blur-sm clip-hud relative group/bubble ${
                         msg.role === 'user' 
                         ? 'bg-accent-900/20 border-accent-500/30 text-shadow-100' 
                         : msg.isSystemNudge 
                            ? 'bg-yellow-900/20 border-yellow-600/50 text-yellow-100'
                            : 'bg-shadow-900/40 border-shadow-700 text-cyan-100'
                     }`}>
                         {/* Decoration for AI/System */}
                         {msg.role === 'model' && (
                             <div className={`absolute -left-1 top-4 w-0.5 h-4 ${msg.isSystemNudge ? 'bg-yellow-500' : 'bg-cyan-500/50'}`} />
                         )}
                         
                         {/* System Icon */}
                         {msg.isSystemNudge && <AlertTriangle size={16} className="text-yellow-500 inline mr-2 mb-1" />}
                         
                         {msg.text}

                         {/* TTS Button for AI Messages */}
                         {msg.role === 'model' && (
                             <button 
                                onClick={() => speak(msg.text)}
                                className="absolute -right-8 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full text-shadow-600 hover:text-cyan-400 opacity-0 group-hover/bubble:opacity-100 transition-all"
                                title="Read Aloud"
                             >
                                 <Volume2 size={14} />
                             </button>
                         )}
                     </div>
                 </div>
             </div>
         ))}
         
         {isTyping && (
             <div className="flex justify-start">
                 <div className="bg-shadow-900/40 border border-shadow-700 px-4 py-3 flex gap-2 items-center clip-hud">
                     <span className="text-[10px] text-cyan-500 uppercase tracking-widest animate-pulse">Processing</span>
                     <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-none animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-none animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-none animate-bounce" style={{ animationDelay: '300ms' }} />
                     </div>
                 </div>
             </div>
         )}
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area / Command Deck */}
      <div className="pt-4 pb-2">
          {isVoiceActive ? (
              <div className="bg-shadow-900/20 border border-red-900/30 p-8 flex flex-col items-center justify-center gap-6 relative overflow-hidden clip-corner-tr">
                  {/* Background Warning Stripes */}
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(220,38,38,0.05)_10px,rgba(220,38,38,0.05)_20px)]" />
                  
                  <p className="text-red-400 font-mono tracking-[0.2em] animate-pulse uppercase relative z-10">
                      &lt; Awaiting Verbal Commands &gt;
                  </p>
                  
                  <button 
                    onClick={() => setVoiceActive(false)}
                    className="px-8 py-2 bg-black/50 border border-red-500/50 hover:bg-red-900/20 hover:border-red-500 text-red-400 text-xs uppercase tracking-widest transition-all relative z-10 group"
                  >
                      <span className="group-hover:hidden">Terminate Uplink</span>
                      <span className="hidden group-hover:inline">Disengage</span>
                  </button>
              </div>
          ) : (
              <div className="flex items-end gap-3 bg-shadow-900/40 p-3 border border-shadow-700 relative clip-corner-tr transition-all focus-within:border-accent-500/50 focus-within:bg-shadow-900/60">
                   {/* Corner Decoration */}
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-accent-500/30" />

                  <button 
                    onClick={() => setVoiceActive(true)}
                    className="p-4 bg-shadow-800/50 border border-shadow-600 text-shadow-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-900/10 transition-all"
                    title="Initialize Voice Uplink"
                  >
                      <Mic size={20} />
                  </button>
                  
                  <div className="flex-1 relative">
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter command parameter..."
                        className="w-full bg-transparent border-none outline-none text-shadow-100 placeholder-shadow-600 py-3 font-mono text-sm resize-none h-[50px]"
                        rows={1}
                      />
                      {/* Blinking Cursor Block if empty */}
                      {!inputText && (
                          <div className="absolute top-4 left-0 w-2 h-4 bg-accent-500/50 animate-pulse pointer-events-none" />
                      )}
                  </div>
                  
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isTyping}
                    className="p-4 bg-accent-600/80 hover:bg-accent-500 text-white border border-accent-400 disabled:opacity-30 disabled:border-shadow-700 disabled:bg-shadow-800 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
                  >
                      <Send size={18} className={inputText.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''} />
                  </button>
              </div>
          )}
          <p className="text-center text-[9px] text-shadow-600 mt-3 font-mono tracking-widest uppercase">
              System Confidence Level: 98.4% // Output may vary based on quantum fluctuations
          </p>
      </div>
    </div>
  );
};
