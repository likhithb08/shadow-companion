
import React from 'react';
import { Brain, Zap, Timer, History, Activity, Play, AlertTriangle, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FocusHub: React.FC = () => {
  const { startFocusMode, activityLog, user } = useApp();

  // Calculate simple stats from activity log
  const focusSessions = activityLog.filter(l => l.action === 'timer-stop').length;
  const idleIncidents = activityLog.filter(l => l.action === 'idle-detected').length;
  
  // Mock calculation for total focus minutes
  const totalFocusMinutes = (user?.creditsUsed || 0) / 2; 

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-shadow-800 pb-4">
          <div>
              <h2 className="text-2xl font-bold tracking-widest uppercase flex items-center gap-3">
                  <Brain className="text-accent-500" />
                  Neural Focus Hub
              </h2>
              <p className="text-shadow-400 text-sm mt-1 font-mono">Productivity Enhancement & Behavior Analytics</p>
          </div>
      </div>

      {/* Focus Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* 25m Card */}
           <button 
             onClick={() => startFocusMode(null, 25)}
             className="bg-shadow-900/50 border border-shadow-700 hover:border-accent-500 hover:bg-shadow-800 p-6 rounded-2xl group transition-all text-left relative overflow-hidden"
           >
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Timer size={64} />
               </div>
               <div className="flex items-center gap-3 mb-4">
                   <div className="p-3 bg-accent-600/20 text-accent-400 rounded-lg group-hover:bg-accent-600 group-hover:text-white transition-colors">
                       <Zap size={24} />
                   </div>
                   <div>
                       <h3 className="font-bold text-lg text-white">Pomodoro</h3>
                       <p className="text-xs text-shadow-400">25 Minutes</p>
                   </div>
               </div>
               <p className="text-sm text-shadow-300 leading-relaxed mb-4">
                   Standard intensity cycle. Ideal for clearing backlog tasks.
               </p>
               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-500 group-hover:text-accent-400">
                   Initialize <Play size={12} />
               </div>
           </button>

           {/* 45m Card */}
           <button 
             onClick={() => startFocusMode(null, 45)}
             className="bg-shadow-900/50 border border-shadow-700 hover:border-cyan-500 hover:bg-shadow-800 p-6 rounded-2xl group transition-all text-left relative overflow-hidden"
           >
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Brain size={64} />
               </div>
               <div className="flex items-center gap-3 mb-4">
                   <div className="p-3 bg-cyan-600/20 text-cyan-400 rounded-lg group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                       <Activity size={24} />
                   </div>
                   <div>
                       <h3 className="font-bold text-lg text-white">Deep Work</h3>
                       <p className="text-xs text-shadow-400">45 Minutes</p>
                   </div>
               </div>
               <p className="text-sm text-shadow-300 leading-relaxed mb-4">
                   High cognition mode. Recommended for learning and creation.
               </p>
               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-500 group-hover:text-cyan-400">
                   Initialize <Play size={12} />
               </div>
           </button>

           {/* 90m Card */}
           <button 
             onClick={() => startFocusMode(null, 90)}
             className="bg-shadow-900/50 border border-shadow-700 hover:border-purple-500 hover:bg-shadow-800 p-6 rounded-2xl group transition-all text-left relative overflow-hidden"
           >
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Brain size={64} />
               </div>
               <div className="flex items-center gap-3 mb-4">
                   <div className="p-3 bg-purple-600/20 text-purple-400 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                       <Zap size={24} />
                   </div>
                   <div>
                       <h3 className="font-bold text-lg text-white">Flow State</h3>
                       <p className="text-xs text-shadow-400">90 Minutes</p>
                   </div>
               </div>
               <p className="text-sm text-shadow-300 leading-relaxed mb-4">
                   Maximum neural density. Zero interruptions.
               </p>
               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-500 group-hover:text-purple-400">
                   Initialize <Play size={12} />
               </div>
           </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Stats Column */}
          <div className="lg:col-span-1 space-y-4">
               <h3 className="text-sm font-bold uppercase tracking-widest text-shadow-400 flex items-center gap-2">
                   <Activity size={16} /> Performance Metrics
               </h3>
               
               {/* Streak Card */}
               <div className="bg-shadow-900 border border-shadow-800 rounded-xl p-6 clip-corner-tr relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-orange-600/10 rounded-full blur-2xl group-hover:bg-orange-600/20 transition-colors" />
                   <div className="flex items-center gap-3 mb-1">
                       <div className="text-3xl font-bold text-white font-mono">{user?.focusStreak || 0}</div>
                       <Flame className="text-orange-500 animate-pulse" fill="currentColor" size={24} />
                   </div>
                   <div className="text-xs text-shadow-500 uppercase tracking-wider">Current Focus Streak</div>
               </div>

               <div className="bg-shadow-900 border border-shadow-800 rounded-xl p-6 clip-corner-tr relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-green-600/10 rounded-full blur-2xl" />
                   <div className="text-3xl font-bold text-white font-mono">~{totalFocusMinutes}m</div>
                   <div className="text-xs text-shadow-500 uppercase tracking-wider mt-1">Total Focus Time</div>
               </div>

               <div className="bg-shadow-900 border border-shadow-800 rounded-xl p-6 clip-corner-tr relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-red-600/10 rounded-full blur-2xl" />
                   <div className="text-3xl font-bold text-white font-mono">{idleIncidents}</div>
                   <div className="text-xs text-shadow-500 uppercase tracking-wider mt-1 text-red-400">Idle / Drift Events</div>
               </div>
          </div>

          {/* Activity Log Terminal */}
          <div className="lg:col-span-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-shadow-400 flex items-center gap-2 mb-4">
                   <History size={16} /> System Activity Log
              </h3>
              
              <div className="bg-black/50 border border-shadow-800 rounded-xl p-4 font-mono text-xs h-[300px] overflow-y-auto custom-scrollbar relative clip-hud">
                  {/* Scanline overlay inside terminal */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] pointer-events-none bg-[length:100%_4px,6px_100%] z-0" />
                  
                  <div className="relative z-10 space-y-2">
                      {activityLog.length === 0 && (
                          <div className="text-shadow-600 italic">// No activity recorded yet...</div>
                      )}
                      {[...activityLog].reverse().map((log, i) => (
                          <div key={i} className="flex gap-4 border-b border-shadow-900/50 pb-1">
                              <span className="text-shadow-600 shrink-0">
                                  [{new Date(log.timestamp).toLocaleTimeString()}]
                              </span>
                              <span className={`shrink-0 font-bold uppercase w-32 ${
                                  log.action.includes('timer') ? 'text-accent-400' : 
                                  log.action.includes('idle') ? 'text-red-400' :
                                  'text-cyan-600'
                              }`}>
                                  {log.action}
                              </span>
                              <span className="text-shadow-300 truncate">
                                  {log.details}
                              </span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
