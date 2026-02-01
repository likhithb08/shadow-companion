
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, XCircle, CheckCircle2, Lock, Brain, Trophy, ArrowRight, Flame } from 'lucide-react';

export const FocusMode: React.FC = () => {
  const { focusState, stopFocusMode, tasks, toggleTask, user } = useApp();
  const [timeLeft, setTimeLeft] = useState(0);
  const [giveUpStep, setGiveUpStep] = useState(0); // 0=none, 1=confirm
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  
  const currentTask = tasks.find(t => t.id === focusState.taskId);

  // Initialize Timer
  useEffect(() => {
    if (focusState.isActive && !isSessionComplete) {
      setTimeLeft(focusState.durationMinutes * 60);
      setGiveUpStep(0);
      setIsSessionComplete(false);
    }
  }, [focusState.isActive, focusState.durationMinutes, isSessionComplete]);

  // Prevent Browser Tab Close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (focusState.isActive) {
            e.preventDefault();
            e.returnValue = ''; // Chrome requires returnValue to be set
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [focusState.isActive]);

  // Timer Logic
  useEffect(() => {
    if (!focusState.isActive || isSessionComplete) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [focusState.isActive, isSessionComplete]);

  const handleSessionEnd = () => {
      setIsSessionComplete(true);
      // We don't call stopFocusMode yet, we wait for user to click return to see the stats.
      // However, we can simulate the "points" view here.
  };

  const handleExit = (success: boolean) => {
      stopFocusMode(success);
      setIsSessionComplete(false);
  };

  if (!focusState.isActive) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((focusState.durationMinutes * 60 - timeLeft) / (focusState.durationMinutes * 60)) * 100;

  const handleGiveUp = () => {
      if (giveUpStep === 0) {
          setGiveUpStep(1);
      } else {
          handleExit(false); // Fail
      }
  };

  const handleCompleteTask = () => {
      if (focusState.taskId) {
          toggleTask(focusState.taskId);
      }
  };

  // --- Session Complete View ---
  if (isSessionComplete) {
      // Calculate projected rewards for display
      const currentStreak = user?.focusStreak || 0;
      const nextStreak = currentStreak + 1;
      const points = (focusState.durationMinutes * 2) + (nextStreak * 5);

      return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center text-white animate-in fade-in duration-500">
             <div className="max-w-md w-full text-center p-8 bg-shadow-900/50 border border-green-500/30 rounded-2xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-green-500/5 animate-pulse" />
                 
                 <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                     <Trophy size={40} className="text-green-400" />
                 </div>
                 
                 <h2 className="text-3xl font-bold font-mono mb-2 text-white">SESSION COMPLETE</h2>
                 <p className="text-green-400 text-sm font-bold uppercase tracking-widest mb-6">Objective Secured</p>
                 
                 <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="bg-black/40 p-3 rounded-xl border border-green-500/20">
                         <div className="text-2xl font-bold text-white">+{points}</div>
                         <div className="text-[10px] text-shadow-400 uppercase tracking-wider">Credits Earned</div>
                     </div>
                     <div className="bg-black/40 p-3 rounded-xl border border-green-500/20">
                         <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                             {nextStreak} <Flame size={18} className="text-orange-500" fill="currentColor" />
                         </div>
                         <div className="text-[10px] text-shadow-400 uppercase tracking-wider">Focus Streak</div>
                     </div>
                 </div>

                 <button 
                    onClick={() => handleExit(true)}
                    className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center gap-3"
                 >
                     Return to Command <ArrowRight size={18} />
                 </button>
             </div>
        </div>
      );
  }

  // --- Active Timer View ---
  return (
    <div className="fixed inset-0 z-[100] bg-black/98 flex flex-col items-center justify-center text-white cursor-default select-none">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-2 text-red-500 animate-pulse">
              <Lock size={18} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Interface Locked</span>
          </div>
          <div className="flex items-center gap-2 text-shadow-400">
              <Brain size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Neural Flow State</span>
          </div>
      </div>

      {/* Main Timer */}
      <div className="relative z-10 flex flex-col items-center mb-12">
          {/* Progress Ring Background */}
          <div className="w-72 h-72 rounded-full border-4 border-shadow-800 flex items-center justify-center relative">
               <svg className="absolute inset-0 w-full h-full transform -rotate-90 p-1">
                   <circle 
                     cx="140" cy="140" r="136" 
                     stroke="currentColor" 
                     strokeWidth="6" 
                     fill="transparent" 
                     className="text-accent-600 transition-all duration-1000 ease-linear shadow-[0_0_20px_currentColor]"
                     strokeDasharray={854} 
                     strokeDashoffset={854 - (854 * progress) / 100}
                     strokeLinecap="round"
                   />
               </svg>
               <div className="text-8xl font-mono font-bold tracking-tighter holo-text text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                   {formatTime(timeLeft)}
               </div>
          </div>
          <p className="mt-6 text-shadow-500 text-sm uppercase tracking-[0.3em] animate-pulse">Focus Duration Remaining</p>
      </div>

      {/* Current Task */}
      <div className="max-w-xl w-full px-6 text-center z-10 mb-12">
          <h2 className="text-xs text-accent-400 uppercase tracking-[0.3em] mb-6">Current Objective</h2>
          {currentTask ? (
              <div className="bg-shadow-900/50 border border-accent-500/30 p-8 rounded-2xl relative overflow-hidden group backdrop-blur-md">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent-500" />
                  <h3 className={`text-3xl font-bold ${currentTask.completed ? 'line-through text-shadow-500' : 'text-white'} leading-tight`}>
                      {currentTask.text}
                  </h3>
                  {!currentTask.completed && (
                      <button 
                        onClick={handleCompleteTask}
                        className="mt-6 px-8 py-3 bg-accent-600 hover:bg-accent-500 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                      >
                          Mark Objective Complete
                      </button>
                  )}
                  {currentTask.completed && (
                       <div className="mt-4 text-green-500 flex items-center justify-center gap-2 font-bold uppercase tracking-wider">
                           <CheckCircle2 size={20} /> Objective Secured
                       </div>
                  )}
              </div>
          ) : (
              <div className="text-3xl font-bold text-shadow-300 tracking-wider">FREE FLOW FOCUS</div>
          )}
      </div>

      {/* Controls */}
      <div className="z-10">
          <button 
            onClick={handleGiveUp}
            className={`px-8 py-3 rounded-full border transition-all text-xs font-bold uppercase tracking-widest ${
                giveUpStep === 1 
                ? 'bg-red-900/20 border-red-500 text-red-500 hover:bg-red-900/40 shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
                : 'bg-transparent border-shadow-700 text-shadow-500 hover:text-shadow-300 hover:border-shadow-500'
            }`}
          >
              {giveUpStep === 1 ? '⚠️ Confirm: Streak will Reset' : 'Exit Focus Mode'}
          </button>
      </div>

    </div>
  );
};
