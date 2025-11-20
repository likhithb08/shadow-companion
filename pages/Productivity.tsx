import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Productivity: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useApp();
  const [newTask, setNewTask] = useState("");

  const handleAdd = () => {
      if (!newTask.trim()) return;
      addTask(newTask, "General");
      setNewTask("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Task List */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Focus Dashboard</h2>
                <span className="text-xs text-shadow-500 bg-shadow-900 px-2 py-1 rounded border border-shadow-800">
                    Voice Tip: "Add a task to call mom"
                </span>
            </div>
            
            <div className="bg-shadow-900 border border-shadow-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-shadow-800 flex gap-2">
                    <input 
                        type="text" 
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        placeholder="Add a new task..." 
                        className="flex-1 bg-transparent outline-none text-shadow-100 placeholder-shadow-600"
                    />
                    <button onClick={handleAdd} className="bg-accent-600 hover:bg-accent-500 text-white p-2 rounded-lg transition-colors">
                        <Plus size={20} />
                    </button>
                </div>
                
                <div className="divide-y divide-shadow-800/50">
                    {tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 p-4 hover:bg-shadow-800/30 transition-colors group">
                            <button onClick={() => toggleTask(task.id)} className={`${task.completed ? 'text-accent-500' : 'text-shadow-600'}`}>
                                {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                            </button>
                            <span className={`flex-1 ${task.completed ? 'line-through text-shadow-500' : 'text-shadow-200'}`}>
                                {task.text}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-md bg-shadow-800 text-shadow-400">
                                {task.category}
                            </span>
                            <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-400/10 p-1 rounded">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {tasks.length === 0 && (
                        <div className="p-8 text-center text-shadow-500 italic">
                            No tasks active. You are free.
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Stats & Goals */}
        <div className="space-y-6">
            <div className="bg-shadow-900 border border-shadow-800 rounded-xl p-6">
                <h3 className="font-bold mb-4 text-shadow-200">Daily Progress</h3>
                <div className="relative w-full h-4 bg-shadow-800 rounded-full overflow-hidden mb-2">
                    <div 
                        className="absolute top-0 left-0 h-full bg-accent-600 transition-all duration-500" 
                        style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` }}
                    />
                </div>
                <p className="text-xs text-shadow-400 text-right">
                    {tasks.filter(t => t.completed).length} / {tasks.length} Completed
                </p>
            </div>

            <div className="bg-gradient-to-br from-accent-900 to-shadow-900 border border-shadow-800 rounded-xl p-6">
                <h3 className="font-bold mb-2 text-white">Anti-Procrastination</h3>
                <p className="text-sm text-shadow-300 mb-4">
                    "The best way to predict the future is to create it."
                </p>
                <div className="flex gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-mono text-green-400">AI WATCHING</span>
                </div>
            </div>
        </div>
    </div>
  );
};
