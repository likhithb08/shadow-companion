import React from 'react';
import { Mic, MicOff, Sparkles, Settings, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Companion: React.FC = () => {
  const { isVoiceActive, setVoiceActive, preferences, updatePreferences } = useApp();

  const voices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-shadow-400 bg-clip-text text-transparent">
          Shadow Configuration
        </h2>
        <p className="text-shadow-400">
          Customize your neural interface.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Voice Status Card */}
        <div className="bg-shadow-900 border border-shadow-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
            <div className={`absolute inset-0 bg-accent-600/10 blur-3xl transition-opacity ${isVoiceActive ? 'opacity-100' : 'opacity-0'}`} />
            
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                isVoiceActive 
                ? 'bg-red-500/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
                : 'bg-shadow-800 text-shadow-400'
            }`}>
                {isVoiceActive ? <Mic size={40} className="animate-pulse" /> : <MicOff size={40} />}
            </div>

            <div className="text-center relative z-10">
                <h3 className="text-xl font-bold mb-1">{isVoiceActive ? 'System Online' : 'System Standby'}</h3>
                <p className="text-shadow-500 text-sm">
                    {isVoiceActive ? 'Listening for commands...' : 'Tap to initialize voice link'}
                </p>
            </div>

            <button
              onClick={() => setVoiceActive(!isVoiceActive)}
              className={`relative z-10 px-8 py-3 rounded-full font-medium transition-all duration-300 ${
                isVoiceActive 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-accent-600 text-white hover:bg-accent-500'
              }`}
            >
              {isVoiceActive ? 'Disconnect' : 'Connect Shadow'}
            </button>
        </div>

        {/* Configuration Form */}
        <div className="space-y-6">
            <div className="bg-shadow-900 border border-shadow-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-shadow-200">
                    <User size={20} />
                    <h3 className="font-bold">Identity</h3>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-shadow-500 uppercase font-bold mb-2">Your Name</label>
                        <input 
                            type="text" 
                            value={preferences.userName}
                            onChange={(e) => updatePreferences({ userName: e.target.value })}
                            className="w-full bg-shadow-950 border border-shadow-800 rounded-lg px-4 py-2 text-shadow-100 focus:border-accent-600 outline-none"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-shadow-500 uppercase font-bold mb-2">Voice Model</label>
                        <div className="grid grid-cols-3 gap-2">
                            {voices.map(voice => (
                                <button
                                    key={voice}
                                    onClick={() => updatePreferences({ voiceName: voice as any })}
                                    className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                                        preferences.voiceName === voice 
                                        ? 'bg-accent-600/20 border-accent-600 text-accent-400' 
                                        : 'bg-shadow-950 border-shadow-800 text-shadow-400 hover:border-shadow-600'
                                    }`}
                                >
                                    {voice}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-shadow-900 border border-shadow-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-shadow-200">
                    <Settings size={20} />
                    <h3 className="font-bold">System Instructions</h3>
                </div>
                <p className="text-xs text-shadow-500 mb-3">Define how Shadow behaves, speaks, and interacts with you.</p>
                <textarea 
                    value={preferences.systemInstruction}
                    onChange={(e) => updatePreferences({ systemInstruction: e.target.value })}
                    className="w-full h-32 bg-shadow-950 border border-shadow-800 rounded-lg px-4 py-3 text-sm text-shadow-200 focus:border-accent-600 outline-none resize-none"
                />
                <div className="mt-2 flex justify-end">
                   {isVoiceActive && <span className="text-xs text-yellow-500">Disconnect to apply changes</span>}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
