import React, { useState } from 'react';
import { Cpu, ArrowRight, Lock, Mail, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Login: React.FC = () => {
  const { login, signup } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let success;
      if (isLogin) {
        success = await login(formData.email, formData.password);
      } else {
        success = await signup(formData.email, formData.password, formData.name);
      }

      if (!success) {
        setError(isLogin ? 'Invalid credentials.' : 'User already exists.');
      }
    } catch (e) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-shadow-950 text-shadow-100 font-sans flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20 pointer-events-none z-0" />
      <div className="scanlines"></div>
      
      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
             <div className="w-16 h-16 relative flex items-center justify-center mb-4">
                <div className="absolute inset-0 border-2 border-accent-500 rounded-lg transform rotate-45 animate-pulse"></div>
                <div className="absolute inset-0 border-2 border-cyan-500 rounded-lg transform -rotate-12"></div>
                <Cpu size={32} className="text-white relative z-10" />
            </div>
            <h1 className="font-bold text-3xl tracking-[0.2em] text-white holo-text">SHADOW ACCESS</h1>
            <p className="text-xs text-accent-400 tracking-widest uppercase mt-2">Identify Verified Personnel</p>
        </div>

        <div className="bg-shadow-900/80 backdrop-blur-xl border border-shadow-700 p-8 clip-hud relative">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-accent-500/50" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-accent-500/50" />

            <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-shadow-500 uppercase tracking-wider">Designation (Name)</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-shadow-600" size={18} />
                            <input 
                                type="text" 
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-black/50 border border-shadow-700 rounded px-10 py-3 text-sm focus:border-accent-500 outline-none transition-colors text-white"
                                placeholder="Enter your name"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-bold text-shadow-500 uppercase tracking-wider">Comm Link (Email)</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-shadow-600" size={18} />
                        <input 
                            type="email" 
                            required
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-black/50 border border-shadow-700 rounded px-10 py-3 text-sm focus:border-accent-500 outline-none transition-colors text-white"
                            placeholder="name@shadow.ai"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-shadow-500 uppercase tracking-wider">Encryption Key (Password)</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-shadow-600" size={18} />
                        <input 
                            type="password" 
                            required
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            className="w-full bg-black/50 border border-shadow-700 rounded px-10 py-3 text-sm focus:border-accent-500 outline-none transition-colors text-white"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-red-400 text-xs font-mono border border-red-900/50 bg-red-900/10 p-2 text-center">
                        ⚠ {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 bg-accent-600 hover:bg-accent-500 text-white font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            {isLogin ? 'Initialize Uplink' : 'Register Unit'} <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button 
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    className="text-xs text-shadow-400 hover:text-accent-400 uppercase tracking-wide transition-colors"
                >
                    {isLogin ? "Need Access Credentials? Register" : "Already Verified? Login"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};