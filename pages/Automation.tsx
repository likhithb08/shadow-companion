import React from 'react';
import { GitBranch, Play, Plus, Settings } from 'lucide-react';

export const Automation: React.FC = () => {
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Agent Workflows</h2>
            <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-shadow-200 transition-colors">
                <Plus size={18} />
                New Agent
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Active Agent Card */}
            <div className="bg-shadow-900 border border-accent-600/30 rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-shadow-800 rounded-lg">
                        <GitBranch size={24} className="text-accent-500" />
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-shadow-800 rounded-lg text-shadow-400"><Settings size={16} /></button>
                    </div>
                </div>
                <h3 className="font-bold text-lg mb-1">Daily Digest Summarizer</h3>
                <p className="text-sm text-shadow-400 mb-6">Scrapes TechCrunch & HackerNews, summarizes top 3 articles, sends via email.</p>
                
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-mono text-green-500 bg-green-500/10 px-2 py-1 rounded">ACTIVE</span>
                    <span className="text-xs text-shadow-500">Last run: 1h ago</span>
                </div>
            </div>

            {/* Agent Card */}
            <div className="bg-shadow-900 border border-shadow-800 rounded-xl p-6 relative overflow-hidden hover:border-shadow-600 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-shadow-700" />
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-shadow-800 rounded-lg">
                        <GitBranch size={24} className="text-shadow-400" />
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-shadow-800 rounded-lg text-shadow-400"><Settings size={16} /></button>
                    </div>
                </div>
                <h3 className="font-bold text-lg mb-1">Social Auto-Reply</h3>
                <p className="text-sm text-shadow-400 mb-6">Drafts replies to Twitter mentions using Gemini Pro with "Helpful" tone.</p>
                
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-mono text-shadow-500 bg-shadow-800 px-2 py-1 rounded">PAUSED</span>
                    <button className="text-accent-500 hover:text-accent-400">
                        <Play size={20} />
                    </button>
                </div>
            </div>

        </div>
    </div>
  );
};