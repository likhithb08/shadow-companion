
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Mic, 
  Activity, 
  Users, 
  CheckSquare, 
  MicOff,
  LogOut,
  Cpu,
  Settings as SettingsIcon,
  Target,
  Terminal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLiveSession } from '../hooks/useLiveSession';
import { Visualizer } from './Visualizer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isVoiceActive, setVoiceActive, user, logout } = useApp();
  const { volume } = useLiveSession(isVoiceActive);

  const navItems = [
    { icon: Terminal, label: 'COMMAND', path: '/' },
    { icon: Target, label: 'EVOLUTION', path: '/evolution' },
    { icon: Activity, label: 'INTEL', path: '/updates' },
    { icon: Users, label: 'NETWORK', path: '/feed' },
    { icon: CheckSquare, label: 'MISSIONS', path: '/productivity' },
    { icon: SettingsIcon, label: 'SETTINGS', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-shadow-950 text-shadow-100 font-sans flex flex-col md:flex-row overflow-hidden relative">
      {/* HUD Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-shadow-950 via-transparent to-shadow-950 z-0 opacity-40 pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-shadow-950/80 backdrop-blur-xl border-r border-shadow-800 p-4 z-20 relative">
        <div className="flex items-center gap-3 mb-10 px-2 group cursor-default">
            <div className="w-10 h-10 relative flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-accent-500 rounded-lg transform rotate-45 group-hover:rotate-90 transition-transform duration-700 opacity-50"></div>
                <Cpu size={20} className="text-white relative z-10" />
            </div>
            <div>
                <h1 className="font-bold text-xl tracking-widest text-white holo-text">SHADOW</h1>
                <p className="text-[10px] text-accent-400 tracking-[0.2em] uppercase">Sys.Online.v2.5</p>
            </div>
        </div>

        <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link 
                        key={item.path}
                        to={item.path}
                        className={`relative flex items-center gap-4 px-4 py-3 clip-corner-tr transition-all group border-l-2 ${
                            isActive ? 'bg-accent-600/10 border-accent-500 text-white' : 'border-transparent text-shadow-500 hover:text-accent-400 hover:bg-shadow-900/40'
                        }`}
                    >
                        <item.icon size={18} className={isActive ? 'text-accent-400' : 'text-shadow-600 group-hover:text-accent-400'} />
                        <span className="font-medium tracking-wider text-sm">{item.label}</span>
                        {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse shadow-[0_0_8px_#6366f1]" />}
                    </Link>
                )
            })}
        </nav>

        <div className="mt-auto pt-6 border-t border-shadow-800/50">
            <div className="clip-hud bg-shadow-900/50 border border-shadow-800 p-1">
                <div className="bg-black/40 p-3 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-sm ${isVoiceActive ? 'bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse' : 'bg-shadow-700'}`} />
                            <span className="text-[10px] font-bold tracking-widest uppercase text-shadow-500">VOICE LINK</span>
                        </div>
                        <button onClick={() => setVoiceActive(!isVoiceActive)} className="p-1.5 rounded bg-shadow-800 text-shadow-400 hover:text-accent-400 transition-all border border-shadow-700">
                            {isVoiceActive ? <MicOff size={14} /> : <Mic size={14} />}
                        </button>
                    </div>
                    <div className="h-16 w-full bg-shadow-950 border border-shadow-800/50 relative overflow-hidden">
                        <Visualizer isActive={isVoiceActive} volume={volume} />
                    </div>
                </div>
            </div>
            <button 
              onClick={logout}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-shadow-500 hover:text-red-400 transition-colors uppercase tracking-widest"
            >
              <LogOut size={14} /> Terminate Session
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto p-4 md:p-8">
              {children}
          </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-shadow-950/95 backdrop-blur-xl border-t border-shadow-800 flex items-center justify-around px-2 py-3 z-50">
          {navItems.map((item) => {
               const isActive = location.pathname === item.path;
               return (
                   <Link 
                       key={item.path}
                       to={item.path}
                       className={`flex flex-col items-center gap-1 p-2 rounded transition-all ${
                           isActive ? 'text-accent-400 bg-accent-600/10' : 'text-shadow-500'
                       }`}
                   >
                       <item.icon size={20} />
                       <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
                   </Link>
               );
          })}
      </nav>
    </div>
  );
};
