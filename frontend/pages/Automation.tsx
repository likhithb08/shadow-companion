import React, { useState } from 'react';
import { GitBranch, Play, Plus, Settings, Search, Mail, MessageSquare, AlertCircle, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

const getIcon = (name: string) => {
  switch (name) {
    case 'Mail': return Mail;
    case 'MessageSquare': return MessageSquare;
    case 'AlertCircle': return AlertCircle;
    default: return Zap;
  }
};

export const Automation: React.FC = () => {
  const { workflows } = useApp();
  const [filter, setFilter] = useState('All');

  const filteredWorkflows = (workflows || []).filter(wf => {
    if (filter === 'All') return true;
    return wf.status === filter;
  });

  return (
    <div className="space-y-6 max-w-md mx-auto md:max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
                <GitBranch size={24} className="text-shadow-400" />
                <h2 className="text-xl font-bold">My Workflows</h2>
            </div>
            <button className="p-2 rounded-full hover:bg-shadow-800 text-shadow-400">
                <Search size={24} />
            </button>
        </div>

         {/* Create New Card */}
         <div className="bg-shadow-900 border border-shadow-800 rounded-3xl p-6 relative overflow-hidden">
             <div className="relative z-10 text-center flex flex-col items-center justify-center py-4">
                <div className="w-12 h-12 bg-shadow-800 rounded-2xl flex items-center justify-center mb-4 text-accent-500 shadow-inner">
                    <Plus size={24} />
                </div>
                <h3 className="font-bold text-lg mb-1">Create a New Workflow</h3>
                <p className="text-sm text-shadow-400 mb-6 max-w-[200px]">
                    Automate your tasks with an AI agent.
                </p>
                <button 
                    className="w-full py-3.5 bg-accent-600 hover:bg-accent-500 text-white rounded-full font-bold text-sm transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-95"
                >
                    Start Building
                </button>
             </div>
        </div>

        {/* Tabs */}
        <div className="bg-shadow-900 p-1 rounded-xl flex">
            {['All', 'Active', 'Drafts'].map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                        filter === f 
                        ? 'bg-accent-600 text-white shadow-md' 
                        : 'text-shadow-500 hover:text-shadow-300'
                    }`}
                >
                    {f}
                </button>
            ))}
        </div>

        {/* Workflow List */}
        <div className="space-y-4 pb-20">
            {filteredWorkflows.map(wf => {
                const Icon = getIcon(wf.iconName);
                return (
                <div key={wf.id} className="bg-shadow-900 border border-shadow-800 rounded-2xl p-5 relative group hover:border-shadow-600 transition-all">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-shadow-800/50 rounded-xl">
                                <Icon size={20} className={wf.status === 'Error' ? 'text-red-500' : 'text-accent-500'} />
                            </div>
                            <div>
                                <h4 className="font-bold text-base text-shadow-100">{wf.title}</h4>
                                <p className="text-xs text-shadow-500 mt-0.5">{wf.desc}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full 
                                ${wf.status === 'Active' ? 'bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : ''}
                                ${wf.status === 'Paused' ? 'bg-shadow-500' : ''}
                                ${wf.status === 'Error' ? 'bg-red-500' : ''}
                            `} />
                            <span className={`text-xs font-medium
                                ${wf.status === 'Active' ? 'text-green-500' : ''}
                                ${wf.status === 'Paused' ? 'text-shadow-500' : ''}
                                ${wf.status === 'Error' ? 'text-red-500' : ''}
                            `}>
                                {wf.status}
                            </span>
                        </div>
                    </div>

                    <div className="h-px bg-shadow-800 mb-4" />

                    <div className="flex justify-end gap-3">
                        <button className="px-6 py-2 bg-shadow-800 hover:bg-shadow-700 text-shadow-200 rounded-lg text-xs font-bold transition-colors">
                            Edit
                        </button>
                        <button className="px-6 py-2 bg-accent-600/10 hover:bg-accent-600/20 text-accent-400 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                            <Play size={14} />
                            Run
                        </button>
                    </div>
                </div>
            )})}
        </div>
    </div>
  );
};