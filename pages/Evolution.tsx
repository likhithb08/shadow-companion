
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EgoRadar } from '../components/EgoRadar';
import { Target, Zap, Trophy, XCircle, CheckCircle, Flame, Plus, Sparkles, Send, ShieldCheck, Loader2, AlertTriangle, ShieldAlert, BrainCircuit } from 'lucide-react';
import { EgoStats } from '../types';

export const Evolution: React.FC = () => {
  const { user, egoEvolution, activateDevourMode, activateSkillAwakening, toggleEgoTask, submitTestAnswer, cancelDevourMode } = useApp();
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [isAwakening, setIsAwakening] = useState(false);
  const [testAnswer, setTestAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  if (!user) return null;

  const categories: (keyof EgoStats)[] = ['focus', 'discipline', 'skill', 'speed', 'creativity', 'mentalStrength'];
  const total = categories.reduce((sum, cat) => {
      const val = user.egoStats[cat];
      return sum + (cat === egoEvolution.targetStat ? Math.max(0, val - egoEvolution.reductionAmount) : val);
  }, 0);
  const average = Math.round(total / 6);

  const handleAwaken = async () => {
      if (!customSkillInput.trim()) return;
      setIsAwakening(true);
      await activateSkillAwakening(customSkillInput);
      setCustomSkillInput('');
      setIsAwakening(false);
  };

  const handleTestSubmit = async () => {
      if (!testAnswer.trim()) return;
      setIsEvaluating(true);
      await submitTestAnswer(testAnswer);
      setTestAnswer('');
      setIsEvaluating(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="text-center bg-shadow-900 border border-shadow-800 p-10 clip-hud relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
              <div className="flex flex-wrap gap-4 p-4 text-white text-4xl font-black">
                  {Array.from({length: 20}).map((_, i) => <span key={i} className="rotate-12 italic">EVOLVE</span>)}
              </div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2 italic relative z-10">EGO EVOLUTION</h1>
          <p className="text-accent-500 font-mono text-xs tracking-widest uppercase relative z-10">The Blue Lock Philosophy: Testing is truth.</p>
          <div className="mt-8 flex justify-center items-center gap-4 relative z-10">
              <span className="text-6xl font-black font-mono text-white">LVL {average}</span>
              <div className="h-12 w-1 bg-accent-500" />
              <div className="text-left">
                  <div className="text-xs text-shadow-500 uppercase font-bold tracking-widest">Aura Potency</div>
                  <div className="text-accent-400 font-bold uppercase">S-Rank Operative</div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-shadow-900 border border-shadow-800 p-8 rounded-2xl relative clip-corner-tr">
               <h3 className="text-xs font-bold uppercase tracking-widest text-shadow-400 mb-6 flex items-center gap-2">
                   <Target size={16} /> Neural Visualization
               </h3>
               <EgoRadar stats={user.egoStats} targetStat={egoEvolution.targetStat} reduction={egoEvolution.reductionAmount} />
               <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-mono">
                   {categories.map(cat => (
                       <div key={cat} className="flex justify-between p-2 bg-black/40 rounded border border-shadow-800">
                           <span className="text-shadow-500 uppercase">{cat}</span>
                           <span className={cat === egoEvolution.targetStat ? 'text-red-500' : 'text-accent-400'}>
                               {cat === egoEvolution.targetStat ? user.egoStats[cat] - egoEvolution.reductionAmount : user.egoStats[cat]}
                           </span>
                       </div>
                   ))}
               </div>
          </div>

          <div className="space-y-6">
              {!egoEvolution.targetStat ? (
                  <div className="space-y-6">
                      {/* Custom Skill Awakening Input */}
                      <div className="bg-shadow-900 border border-shadow-800 p-6 rounded-2xl clip-hud relative group overflow-hidden">
                          <div className="absolute top-0 right-0 p-2 opacity-10">
                              <Sparkles size={48} className="text-accent-500" />
                          </div>
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                             <Zap size={18} className="text-accent-400" /> Skill Awakening
                          </h3>
                          <p className="text-xs text-shadow-500 mb-4 uppercase tracking-wider">Specify a skill you want to master. System will generate a custom path.</p>
                          <div className="flex gap-2">
                              <input 
                                  type="text" 
                                  value={customSkillInput}
                                  onChange={(e) => setCustomSkillInput(e.target.value)}
                                  placeholder="e.g. Master React Hooks"
                                  className="flex-1 bg-black/50 border border-shadow-700 rounded px-4 py-2 text-sm text-white focus:border-accent-500 outline-none font-mono"
                              />
                              <button 
                                onClick={handleAwaken}
                                disabled={isAwakening || !customSkillInput.trim()}
                                className="bg-accent-600 hover:bg-accent-500 text-white p-2 rounded disabled:opacity-50 transition-all shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                              >
                                  {isAwakening ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                              </button>
                          </div>
                      </div>

                      <div className="bg-shadow-900 border border-shadow-800 p-6 rounded-2xl clip-hud">
                          <h3 className="text-lg font-bold text-white mb-4">Select Domain to Devour</h3>
                          <div className="grid grid-cols-2 gap-3">
                              {categories.map(cat => (
                                  <button key={cat} onClick={() => activateDevourMode(cat)} className="p-4 bg-shadow-800 border border-shadow-700 hover:border-accent-500 text-left transition-all rounded-xl group">
                                      <div className="text-[10px] text-shadow-500 font-bold uppercase tracking-widest group-hover:text-accent-400">Initiate</div>
                                      <div className="text-sm font-bold text-white capitalize">{cat}</div>
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className={`bg-shadow-900 border-2 rounded-2xl clip-hud p-6 transition-all ${egoEvolution.awaitingTest ? 'border-accent-500/50' : 'border-red-500/30'}`}>
                      <div className="flex justify-between items-start mb-6">
                          <div>
                              <div className={`flex items-center gap-2 mb-1 ${egoEvolution.awaitingTest ? 'text-accent-400' : 'text-red-500'}`}>
                                  {egoEvolution.awaitingTest ? <BrainCircuit size={18} className="text-accent-400 animate-pulse" /> : <Zap size={18} className="animate-pulse" />}
                                  <h3 className="text-xl font-black uppercase tracking-tighter italic">
                                      {egoEvolution.awaitingTest ? 'NEURAL TEST PHASE' : (egoEvolution.customSkill ? `AWAKENING: ${egoEvolution.customSkill}` : 'EGO AWAKENING')}
                                  </h3>
                              </div>
                              <p className={`text-[10px] font-bold uppercase tracking-widest ${egoEvolution.awaitingTest ? 'text-accent-300' : 'text-red-400'}`}>
                                  {egoEvolution.awaitingTest ? 'Prove your mastery' : `Targeting ${egoEvolution.targetStat}`}
                              </p>
                          </div>
                          {!egoEvolution.awaitingTest && (
                              <button onClick={cancelDevourMode} className="text-shadow-600 hover:text-white transition-colors">
                                  <XCircle size={20}/>
                              </button>
                          )}
                      </div>

                      {egoEvolution.awaitingTest ? (
                          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                               {!egoEvolution.test ? (
                                   <div className="flex flex-col items-center justify-center py-10 gap-4">
                                       <Loader2 size={32} className="animate-spin text-accent-500" />
                                       <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-accent-400">Generating Neural Challenge...</p>
                                   </div>
                               ) : egoEvolution.testResult ? (
                                   <div className={`p-6 rounded-xl border text-center space-y-4 ${egoEvolution.testResult.passed ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                                       <div className="flex justify-center">
                                           {egoEvolution.testResult.passed ? <CheckCircle size={48} className="text-green-500" /> : <ShieldAlert size={48} className="text-red-500" />}
                                       </div>
                                       <h4 className={`text-xl font-bold uppercase ${egoEvolution.testResult.passed ? 'text-green-400' : 'text-red-400'}`}>
                                           {egoEvolution.testResult.passed ? 'EVOLUTION VERIFIED' : 'TEST FAILED'}
                                       </h4>
                                       <p className="text-sm font-mono text-shadow-300">{egoEvolution.testResult.feedback}</p>
                                       {!egoEvolution.testResult.passed && (
                                           <p className="text-[10px] text-red-500 uppercase font-bold">Neural link disrupted. Reverting to training...</p>
                                       )}
                                   </div>
                               ) : (
                                   <div className="space-y-6">
                                       <div className="bg-black/40 border border-accent-500/20 p-5 rounded-xl">
                                            <div className="text-[9px] uppercase font-bold text-accent-500 mb-2 tracking-widest">Challenge Protocol</div>
                                            <p className="text-sm text-white font-mono leading-relaxed">{egoEvolution.test.question}</p>
                                       </div>
                                       <textarea 
                                          value={testAnswer}
                                          onChange={(e) => setTestAnswer(e.target.value)}
                                          placeholder="Neural response input..."
                                          className="w-full h-32 bg-black/50 border border-accent-500/20 rounded p-4 text-xs font-mono text-accent-100 focus:border-accent-500 outline-none resize-none"
                                       />
                                       <button 
                                          onClick={handleTestSubmit}
                                          disabled={!testAnswer.trim() || isEvaluating}
                                          className="w-full py-3 bg-accent-600 hover:bg-accent-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
                                       >
                                          {isEvaluating ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Transmit Response</>}
                                       </button>
                                   </div>
                               )}
                          </div>
                      ) : (
                          <div className="space-y-3">
                              {egoEvolution.tasks.map(task => (
                                  <button key={task.id} onClick={() => toggleEgoTask(task.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${task.completed ? 'bg-green-900/10 border-green-500/30 text-green-100' : 'bg-black/30 border-shadow-700 text-shadow-300 hover:border-red-500/50'}`}>
                                      {task.completed ? <CheckCircle size={18} className="text-green-500" /> : <div className="w-[18px] h-[18px] border-2 border-shadow-700 rounded-full" />}
                                      <span className={`text-sm font-medium ${task.completed ? 'line-through opacity-50' : ''}`}>{task.text}</span>
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
