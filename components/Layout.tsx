
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Mic, 
  Activity, 
  Users, 
  CheckSquare, 
  User,
  MicOff,
  LogOut,
  Cpu,
  Settings as SettingsIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLiveSession } from '../hooks/useLiveSession';
import { Visualizer } from './Visualizer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Global Voice State from Context
  const { isVoiceActive, setVoiceActive, user, logout } = useApp();
  
  // Initialize session at the Layout level so it persists across route changes
  const { status, volume } = useLiveSession(isVoiceActive);

  const desktopNavItems = [
    { icon: User, label: 'COMMAND', path: '/' },
    { icon: Activity, label: 'INTEL', path: '/updates' },
    { icon: Users, label: 'NETWORK', path: '/feed' },
    { icon: CheckSquare, label: 'MISSIONS', path: '/productivity' },
    { icon: SettingsIcon, label: 'SETTINGS', path: '/settings' },
  ];

  // Mobile Nav
  const mobileNavItems = [
    { icon: Activity, label: 'NEWS', path: '/updates' }, 
    { icon: CheckSquare, label: 'TASKS', path: '/productivity' }, 
    { icon: SettingsIcon, label: 'CONFIG', path: '/settings' }, 
    { icon: User, label: 'HOME', path: '/' },
  ];

  return (
    <div className="min-h-screen bg-shadow-950 text-shadow-100 font-sans flex overflow-hidden pb-20 md:pb-0 relative selection:bg-accent-500/30 selection:text-accent-400">
      
      {/* Background Tech Grid */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-shadow-950 via-transparent to-shadow-950 z-0 opacity-80 pointer-events-none" />

      {/* Desktop Sidebar / HUD Left Panel */}
      <aside className="hidden md:flex flex-col w-72 bg-shadow-950/80 backdrop-blur-xl border-r border-shadow-800 p-4 z-10 relative">
        
        {/* Logo / Status Header */}
        <div className="flex items-center gap-3 mb-10 px-2 group cursor-default">
            <div className="w-10 h-10 relative flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-accent-500 rounded-lg transform rotate-45 group-hover:rotate-90 transition-transform duration-700 opacity-50"></div>
                <div className="absolute inset-0 border-2 border-cyan-500 rounded-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-700 opacity-50"></div>
                <Cpu size={20} className="text-white relative z-10" />
            </div>
            <div>
                <h1 className="font-bold text-xl tracking-widest text-white holo-text">SHADOW</h1>
                <p className="text-[10px] text-accent-400 tracking-[0.2em] uppercase">Sys.Online.v2.5</p>
            </div>
        </div>

        {/* User Profile Snippet */}
        <div className="mb-6 px-4 py-3 bg-shadow-900/50 border border-shadow-800 rounded clip-corner-tr flex items-center justify-between">
           <div>
               <p className="text-[9px] text-shadow-500 uppercase tracking-widest">Operator</p>
               <p className="font-bold text-sm text-white truncate max-w-[120px]">{user?.name}</p>
           </div>
           <button 
             onClick={logout}
             className="text-shadow-500 hover:text-red-400 transition-colors p-1" 
             title="Logout"
            >
               <LogOut size={16} />
           </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
            {desktopNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link 
                        key={item.path}
                        to={item.path}
                        className={`relative flex items-center gap-4 px-4 py-3 clip-corner-tr transition-all group border-l-2 ${
                            isActive 
                            ? 'bg-accent-600/10 border-accent-500 text-white' 
                            : 'border-transparent text-shadow-500 hover:text-accent-400 hover:bg-shadow-900/50 hover:border-shadow-700'
                        }`}
                    >
                        <item.icon size={18} className={`transition-colors ${isActive ? 'text-accent-400' : 'text-shadow-600 group-hover:text-accent-400'}`} />
                        <span className="font-medium tracking-wider text-sm">{item.label}</span>
                        
                        {isActive && (
                            <div className="absolute right-2 w-1.5 h-1.5 bg-accent-400 rounded-full animate-pulse shadow-[0_0_10px_#6366f1]" />
                        )}
                    </Link>
                )
            })}
        </nav>

        {/* Voice Status / Mini HUD */}
        <div className="mt-auto pt-6 border-t border-shadow-800/50">
            <div className="clip-hud bg-shadow-900/50 border border-shadow-800 p-1">
                <div className="bg-black/40 p-3 relative overflow-hidden">
                    {/* Decorative Lines */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent-500/50" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent-500/50" />

                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-sm ${isVoiceActive ? 'bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse' : 'bg-shadow-700'}`} />
                            <span className={`text-[10px] font-bold tracking-widest uppercase ${isVoiceActive ? 'text-red-400' : 'text-shadow-500'}`}>
                                {isVoiceActive ? 'Voice Link: ACTIVE' : 'Voice Link: OFFLINE'}
                            </span>
                        </div>
                        <button 
                            onClick={() => setVoiceActive(!isVoiceActive)}
                            className={`p-1.5 rounded transition-all ${
                                isVoiceActive 
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                                : 'bg-shadow-800 text-shadow-400 hover:bg-shadow-700 border border-shadow-700'
                            }`}
                        >
                            {isVoiceActive ? <MicOff size={14} /> : <Mic size={14} />}
                        </button>
                    </div>
                    
                    {/* Visualizer Container */}
                    <div className="h-16 w-full bg-shadow-950 border border-shadow-800/50 relative overflow-hidden">
                         {/* Grid Overlay on Visualizer */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,6px_100%]" />
                        <Visualizer isActive={isVoiceActive} volume={volume} />
                    </div>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10">
          <div className="max-w-6xl mx-auto p-4 md:p-8 pb-28 md:pb-8">
              {children}
          </div>
      </main>

      {/* Mobile Bottom Nav (Cyberpunk Style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-shadow-950/95 backdrop-blur-xl border-t border-shadow-800 flex items-center justify-around px-2 py-3 z-50 safe-area-bottom">
          {mobileNavItems.map((item) => {
               const isActive = location.pathname === item.path;
               return (
                   <Link 
                       key={item.path}
                       to={item.path}
                       className={`flex flex-col items-center gap-1 p-2 rounded transition-colors ${
                           isActive ? 'text-accent-400' : 'text-shadow-500'
                       }`}
                   >
                       <div className={`p-1 rounded ${isActive ? 'bg-accent-500/10' : ''}`}>
                         <item.icon size={20} className={isActive ? 'animate-pulse' : ''} strokeWidth={2} />
                       </div>
                       <span className="text-[9px] font-bold tracking-wider">{item.label}</span>
                   </Link>
               )
          })}
          
          {/* Hexagon Floating Button for Mobile */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
             <div className="relative w-16 h-16 group">
                <button
                    onClick={() => setVoiceActive(!isVoiceActive)}
                    className={`w-16 h-16 clip-hud flex items-center justify-center transition-all duration-300 ${
                        isVoiceActive 
                        ? 'bg-red-600 text-white shadow-[0_0_30px_#dc2626]' 
                        : 'bg-shadow-800 border-2 border-accent-500/30 text-accent-400 hover:border-accent-400 hover:bg-shadow-700'
                    }`}
                >
                    {isVoiceActive ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                {/* Rotating Ring */}
                {isVoiceActive && (
                    <div className="absolute -inset-2 border border-red-500/30 rounded-full animate-spin-slow pointer-events-none" />
                )}
             </div>
          </div>
      </nav>
      
      {/* Mobile Logout (Floating Top Right) */}
      <div className="md:hidden fixed top-4 right-4 z-50">
           <button 
             onClick={logout}
             className="bg-shadow-900/80 backdrop-blur text-shadow-400 border border-shadow-700 p-2 rounded-full hover:text-red-400 hover:border-red-500 transition-colors"
           >
               <LogOut size={16} />
           </button>
      </div>

    </div>
  );
};
