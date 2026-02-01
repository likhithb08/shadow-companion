
import React from 'react';
import { useApp } from '../context/AppContext';
import { EgoRadar } from '../components/EgoRadar';
// Added Circle to lucide-react imports
import { Target, Zap, Trophy, Flame, ChevronRight, XCircle, CheckCircle, Circle } from 'lucide-react';
import { EgoStats } from '../types';

export const Evolution: React.FC = () => {
  const { user, egoEvolution, activateDevourMode, toggleEgoTask, cancelDevourMode } = useApp();

  if (!user) return null;

  const categories: (keyof EgoStats)[] = [
    'focus', 'discipline', 'skill', 'speed', 'creativity', 'mentalStrength'
  ];

  // Calculate Average
  const total = categories.reduce((sum, cat) => sum + user.egoStats[cat], 0);
  const baseAverage = Math.round(total / 6);
  
  // Adjusted average if in devour mode
  const effectiveTotal = categories.reduce((sum, cat) => {
      const val = user.egoStats[cat];
      return sum + (cat === egoEvolution.targetStat ? Math.max(0, val - egoEvolution.reductionAmount) : val);
  }, 0);
  const effectiveAverage = Math.round(effectiveTotal / 6);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      
      {/* Blue Lock Header */}
      <div className="text-center relative py-10 overflow-hidden bg-shadow-900 border border-shadow-800 clip-hud">
          {/* Background Text Decor */}
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] text-[12rem] font-black pointer-events-none select-none -translate-x-1/2 -translate-y-1/2">
              EGO
          </div>

          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">EGO REVOLUTION</h1>
          <p className="text-accent-500 font-mono text-xs tracking-[0.4em] uppercase">Destroy your limits. Devour your weakness.</p>
          
          <div className="mt-8 flex justify-center items-end gap-2">
              <span className="text-shadow-500 text-xs uppercase tracking-widest mb-1">Overall Level</span>
              <span className={`text-6xl font-black font-mono transition-colors ${egoEvolution.targetStat ? 'text-red-500' : 'text-white'}`}>
                  {effectiveAverage}
              </span>
              <div className="flex flex-col items-start mb-2">
                  <div className="w-12 h-1 bg-accent-500 mb-1" />
                  <span className="text-[10px] text-accent-400 font-bold uppercase tracking-widest">Aura Potency</span>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Radar Chart Section */}
          <div className="bg-shadow-900/50 border border-shadow-800 p-8 rounded-2xl relative clip-corner-tr backdrop-blur-sm">
               <h3 className="text-xs font-bold uppercase tracking-widest text-shadow-400 mb-6 flex items-center gap-2">
                   <Target size={16} /> Aura Visualization
               </h3>
               <EgoRadar 
                 stats={user.egoStats} 
                 targetStat={egoEvolution.targetStat} 
                 reduction={egoEvolution.reductionAmount} 
               />
               
               <div className="mt-8 grid grid-cols-2 gap-2 text-[10px] font-mono">
                   {categories.map(cat => (
                       <div key={cat} className="flex justify-between items-center bg-black/30 p-2 rounded border border-shadow-800">
                           <span className="text-shadow-500 uppercase tracking-wider">{cat}</span>
                           <span className={cat === egoEvolution.targetStat ? 'text-red-400 animate-pulse' : 'text-accent-400'}>
                               {user.egoStats[cat]}
                           </span>
                       </div>
                   ))}
               </div>
          </div>

          {/* Evolution Logic Column */}
          <div className="space-y-6">
              
              {/* Devour Mode Control */}
              {!egoEvolution.targetStat ? (
                  <div className="bg-shadow-900 border border-shadow-800 p-6 rounded-2xl clip-hud relative group">
                      <div className="absolute inset-0 bg-accent-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <h3 className="text-lg font-bold text-white mb-2">Initialize Devour Mode</h3>
                      <p className="text-xs text-shadow-500 mb-6 leading-relaxed uppercase tracking-wider">
                          Select a stat to target. Your level will temporarily drop. Prove you've grown to restore and surpass it.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3">
                          {categories.map(cat => (
                              <button
                                key={cat}
                                onClick={() => activateDevourMode(cat)}
                                className="p-3 bg-shadow-800/50 border border-shadow-700 hover:border-accent-500 hover:bg-shadow-700 text-left transition-all rounded-lg group/btn"
                              >
                                  <div className="text-[9px] text-shadow-500 font-bold uppercase tracking-widest mb-1 group-hover/btn:text-accent-400">Improve</div>
                                  <div className="text-xs font-bold text-white capitalize">{cat}</div>
                              </button>
                          ))}
                      </div>
                  </div>
              ) : (
                  <div className="bg-shadow-900 border-2 border-red-500/30 p-6 rounded-2xl clip-hud relative animate-in fade-in slide-in-from-right-4">
                      <div className="flex justify-between items-start mb-6">
                          <div>
                              <div className="flex items-center gap-2 mb-1">
                                  <Zap size={18} className="text-red-500 animate-pulse" />
                                  <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">Ego Awakening: {egoEvolution.targetStat}</h3>
                              </div>
                              <p className="text-[10px] text-red-400 font-bold uppercase tracking-[0.2em]">Neural proof required for restoration</p>
                          </div>
                          <button onClick={cancelDevourMode} className="text-shadow-600 hover:text-white"><XCircle size={20}/></button>
                      </div>

                      <div className="space-y-3">
                          {egoEvolution.tasks.map(task => (
                              <button 
                                key={task.id}
                                onClick={() => toggleEgoTask(task.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                                    task.completed 
                                    ? 'bg-green-900/10 border-green-500/30 text-green-100' 
                                    : 'bg-black/30 border-shadow-700 text-shadow-300 hover:border-red-500/50'
                                }`}
                              >
                                  {task.completed ? <CheckCircle size={18} className="text-green-500" /> : <Circle size={18} className="text-shadow-700" />}
                                  <span className={`text-sm font-medium ${task.completed ? 'line-through opacity-50' : ''}`}>
                                      {task.text}
                                  </span>
                              </button>
                          ))}
                      </div>

                      <div className="mt-8 pt-4 border-t border-shadow-800 text-center">
                          <p className="text-[9px] text-shadow-600 uppercase tracking-widest">
                              Finish all tasks to reach the next stage of evolution.
                          </p>
                      </div>
                  </div>
              )}

              {/* Stats / Info */}
              <div className="grid grid-cols-2 gap-4">
                   <div className="bg-shadow-900/50 border border-shadow-800 p-4 rounded-xl flex items-center gap-4">
                        <div className="p-2 bg-accent-500/20 text-accent-400 rounded-lg">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <div className="text-xl font-black text-white font-mono">{user.creditsUsed}</div>
                            <div className="text-[10px] text-shadow-500 uppercase tracking-widest font-bold">Aura Points</div>
                        </div>
                   </div>
                   <div className="bg-shadow-900/50 border border-shadow-800 p-4 rounded-xl flex items-center gap-4">
                        <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg">
                            <Flame size={20} />
                        </div>
                        <div>
                            <div className="text-xl font-black text-white font-mono">{user.focusStreak}</div>
                            <div className="text-[10px] text-shadow-500 uppercase tracking-widest font-bold">Win Streak</div>
                        </div>
                   </div>
              </div>
          </div>
      </div>
    </div>
  );
};
