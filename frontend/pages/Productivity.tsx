
import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Search, Play, MoreVertical, Trash2, ListTodo, LayoutGrid, CheckSquare, Sparkles, Brain, Timer, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { refineText } from '../services/gemini';

export const Productivity: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask, startFocusMode } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  
  // Track which task is currently selecting a focus duration
  const [focusSelectionId, setFocusSelectionId] = useState<number | null>(null);

  const filteredTasks = tasks.filter(t => {
      if (filter === 'pending') return !t.completed;
      if (filter === 'done') return t.completed;
      return true;
  });

  const handleAddTask = () => {
      if(newTaskText.trim()) {
          addTask(newTaskText, 'General');
          setNewTaskText('');
          setIsAdding(false);
      }
  };

  const handleRefineTask = async () => {
      if(!newTaskText.trim()) return;
      setIsRefining(true);
      const refined = await refineText(newTaskText, "Convert this into a clear, actionable task item. Keep it brief.");
      setNewTaskText(refined);
      setIsRefining(false);
  };

  const handleStartFocus = (taskId: number, minutes: number) => {
      startFocusMode(taskId, minutes);
      setFocusSelectionId(null);
  };

  return (
    <div className="space-y-6 max-w-md mx-auto md:max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
                <LayoutGrid size={24} className="text-shadow-400" />
                <h2 className="text-xl font-bold">My Tasks</h2>
            </div>
            <button className="p-2 rounded-full hover:bg-shadow-800 text-shadow-400">
                <Search size={24} />
            </button>
        </div>

        {/* Create New Card */}
        <div className="bg-shadow-900 border border-shadow-800 rounded-3xl p-6 relative overflow-hidden group">
             {/* Glow Effect */}
             <div className="absolute top-[-50%] left-[50%] transform -translate-x-1/2 w-64 h-64 bg-accent-600/10 rounded-full blur-3xl" />
             
             <div className="relative z-10 text-center flex flex-col items-center justify-center py-4">
                <div className="w-12 h-12 bg-shadow-800 rounded-2xl flex items-center justify-center mb-4 text-accent-500 shadow-inner">
                    <Plus size={24} />
                </div>
                <h3 className="font-bold text-lg mb-1">Create a New Task</h3>
                <p className="text-sm text-shadow-400 mb-6 max-w-[200px]">
                    Capture your ideas and to-dos instantly.
                </p>

                {isAdding ? (
                    <div className="w-full space-y-3">
                         <div className="relative">
                            <input 
                                autoFocus
                                type="text"
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                placeholder="What needs doing?"
                                className="w-full bg-shadow-950 border border-shadow-700 rounded-xl px-4 py-3 pr-10 text-center outline-none focus:border-accent-500 transition-colors"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                            />
                             <button 
                                onClick={handleRefineTask}
                                disabled={isRefining || !newTaskText}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-accent-400 hover:text-white rounded-full hover:bg-shadow-800 transition-colors disabled:opacity-50"
                                title="AI Enhance (Flash Lite)"
                             >
                                 <Sparkles size={16} className={isRefining ? "animate-spin" : ""} />
                             </button>
                         </div>
                         
                         <div className="flex gap-2">
                             <button 
                                onClick={() => setIsAdding(false)}
                                className="flex-1 py-3 rounded-full font-bold text-sm bg-shadow-800 text-shadow-400"
                             >
                                Cancel
                             </button>
                             <button 
                                onClick={handleAddTask}
                                className="flex-1 py-3 rounded-full font-bold text-sm bg-accent-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                             >
                                Add Task
                             </button>
                         </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="w-full py-3.5 bg-accent-600 hover:bg-accent-500 text-white rounded-full font-bold text-sm transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-95"
                    >
                        Start Adding
                    </button>
                )}
             </div>
        </div>

        {/* Filters */}
        <div className="bg-shadow-900 p-1 rounded-xl flex">
            {['all', 'pending', 'done'].map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                        filter === f 
                        ? 'bg-accent-600 text-white shadow-md' 
                        : 'text-shadow-500 hover:text-shadow-300'
                    }`}
                >
                    {f === 'done' ? 'Completed' : f}
                </button>
            ))}
        </div>

        {/* Task List */}
        <div className="space-y-4 pb-20">
            {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-shadow-600">
                    <p>No {filter} tasks found.</p>
                </div>
            ) : (
                filteredTasks.map(task => (
                    <div key={task.id} className="bg-shadow-900 border border-shadow-800 rounded-2xl p-5 relative group hover:border-shadow-600 transition-all">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${task.completed ? 'bg-accent-600/10 text-accent-500' : 'bg-shadow-800 text-shadow-400'}`}>
                                    {task.completed ? <CheckSquare size={20} /> : <ListTodo size={20} />}
                                </div>
                                <div>
                                    <h4 className={`font-bold text-base ${task.completed ? 'line-through text-shadow-500' : 'text-shadow-100'}`}>
                                        {task.text}
                                    </h4>
                                    <p className="text-xs text-shadow-500 mt-0.5">{task.category || 'General'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-shadow-600' : 'bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.5)]'}`} />
                                <span className={`text-xs font-medium ${task.completed ? 'text-shadow-600' : 'text-green-500'}`}>
                                    {task.completed ? 'Done' : 'Active'}
                                </span>
                            </div>
                        </div>

                        {/* Duration Selection Mode */}
                        {focusSelectionId === task.id ? (
                            <div className="bg-shadow-950/50 rounded-xl p-3 mb-3 border border-accent-500/30 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-accent-400">Select Focus Duration</span>
                                    <button onClick={() => setFocusSelectionId(null)} className="text-shadow-500 hover:text-red-400"><X size={14}/></button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <button onClick={() => handleStartFocus(task.id, 25)} className="p-2 bg-shadow-800 hover:bg-accent-600 hover:text-white text-shadow-300 rounded text-xs font-bold transition-colors">
                                        25m<br/><span className="text-[9px] opacity-70 font-normal">Pomodoro</span>
                                    </button>
                                    <button onClick={() => handleStartFocus(task.id, 45)} className="p-2 bg-shadow-800 hover:bg-accent-600 hover:text-white text-shadow-300 rounded text-xs font-bold transition-colors">
                                        45m<br/><span className="text-[9px] opacity-70 font-normal">Deep Work</span>
                                    </button>
                                    <button onClick={() => handleStartFocus(task.id, 90)} className="p-2 bg-shadow-800 hover:bg-accent-600 hover:text-white text-shadow-300 rounded text-xs font-bold transition-colors">
                                        90m<br/><span className="text-[9px] opacity-70 font-normal">Flow</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-px bg-shadow-800 my-4" />
                        )}

                        <div className="flex justify-end gap-3">
                            {!task.completed && focusSelectionId !== task.id && (
                                <button 
                                    onClick={() => setFocusSelectionId(task.id)}
                                    className="px-4 py-2 bg-accent-600/10 hover:bg-accent-600/20 text-accent-400 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-accent-500/20"
                                >
                                    <Brain size={14} />
                                    Focus
                                </button>
                            )}
                            <button 
                                onClick={() => toggleTask(task.id)}
                                className="px-4 py-2 bg-shadow-800 hover:bg-shadow-700 text-shadow-200 rounded-lg text-xs font-bold transition-colors"
                            >
                                {task.completed ? 'Undo' : 'Mark Done'}
                            </button>
                            <button 
                                onClick={() => deleteTask(task.id)}
                                className="px-4 py-2 bg-shadow-800 hover:bg-red-900/30 text-shadow-200 hover:text-red-400 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};
