import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Mic, 
  Activity, 
  Users, 
  CheckSquare, 
  Zap, 
  User,
  Menu,
  X,
  MicOff,
  Radio
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLiveSession } from '../hooks/useLiveSession';
import { Visualizer } from './Visualizer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Global Voice State from Context
  const { isVoiceActive, setVoiceActive } = useApp();
  
  // Initialize session at the Layout level so it persists across route changes
  const { status, volume } = useLiveSession(isVoiceActive);

  const navItems = [
    { icon: User, label: 'Companion & Settings', path: '/' },
    { icon: Activity, label: 'Updates', path: '/updates' },
    { icon: Users, label: 'Social Feed', path: '/feed' },
    { icon: CheckSquare, label: 'Productivity', path: '/productivity' },
    { icon: Zap, label: 'Automation', path: '/automation' },
  ];

  return (
    <div className="min-h-screen bg-shadow-950 text-shadow-100 font-sans flex overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-shadow-900 border-r border-shadow-800 p-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Shadow</h1>
        </div>

        {/* Active Call Widget in Sidebar */}
        <div className="mb-6 p-4 rounded-xl bg-shadow-950 border border-shadow-800 relative overflow-hidden">
           <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs font-bold text-shadow-400">VOICE UPLINK</span>
             </div>
             <Radio size={14} className={status === 'connected' ? 'text-accent-500' : 'text-shadow-600'} />
           </div>
           
           {isVoiceActive ? (
               <div className="h-12 mb-3">
                   <Visualizer isActive={status === 'connected'} volume={volume} />
               </div>
           ) : (
               <p className="text-xs text-shadow-500 mb-3">Disconnected</p>
           )}

           <button 
             onClick={() => setVoiceActive(!isVoiceActive)}
             className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                 isVoiceActive 
                 ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                 : 'bg-accent-600 text-white hover:bg-accent-500'
             }`}
           >
             {isVoiceActive ? <><MicOff size={16} /> End Session</> : <><Mic size={16} /> Connect</>}
           </button>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-accent-600/10 text-accent-500'
                  : 'text-shadow-400 hover:bg-shadow-800 hover:text-shadow-200'
              }`}
            >
              <item.icon size={18} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Nav Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-shadow-950/90 md:hidden flex flex-col p-6 animate-in slide-in-from-left-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Menu</h2>
            <button onClick={() => setIsMobileOpen(false)}>
                <X size={24} />
            </button>
          </div>
          
          {/* Mobile Voice Toggle */}
          <button 
             onClick={() => { setVoiceActive(!isVoiceActive); setIsMobileOpen(false); }}
             className={`w-full py-4 mb-6 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                 isVoiceActive 
                 ? 'bg-red-500 text-white' 
                 : 'bg-accent-600 text-white'
             }`}
           >
             {isVoiceActive ? <><MicOff size={20} /> Disconnect Voice</> : <><Mic size={20} /> Start Voice Session</>}
           </button>

          <nav className="space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl ${
                  location.pathname === item.path
                    ? 'bg-accent-600 text-white'
                    : 'bg-shadow-900 text-shadow-300'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-shadow-800 flex items-center justify-between px-4 bg-shadow-900/50 backdrop-blur sticky top-0 z-40">
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded bg-accent-600 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
             </div>
             <span className="font-bold">Shadow</span>
           </div>
           <div className="flex items-center gap-4">
             {isVoiceActive && (
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             )}
             <button onClick={() => setIsMobileOpen(true)} className="p-2 text-shadow-400">
               <Menu size={24} />
             </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-5xl mx-auto w-full">
                {children}
            </div>
        </div>
      </main>
    </div>
  );
};
