import React, { useEffect, useState } from 'react';
import { generateAIUpdates } from '../services/gemini';
import { AIUpdate } from '../types';
import { RefreshCw, ExternalLink, Newspaper } from 'lucide-react';

export const Updates: React.FC = () => {
  const [updates, setUpdates] = useState<AIUpdate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUpdates = async () => {
    setLoading(true);
    const data = await generateAIUpdates();
    setUpdates(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold">AI Updates Tracker</h2>
            <p className="text-shadow-400 text-sm">Real-time intelligence on the AI landscape</p>
        </div>
        <button 
          onClick={fetchUpdates}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-shadow-800 hover:bg-shadow-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && updates.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 bg-shadow-900 rounded-xl animate-pulse border border-shadow-800" />
            ))
        ) : (
            updates.map((update, idx) => (
                <div key={idx} className="group relative bg-shadow-900 border border-shadow-800 rounded-xl p-6 hover:border-accent-600/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Newspaper size={16} className="text-accent-500" />
                            <span className="text-xs font-mono text-shadow-500">{update.source || 'AI Digest'}</span>
                        </div>
                        <span className="text-xs text-shadow-500">{update.date}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2 group-hover:text-accent-400 transition-colors">{update.title}</h3>
                    <p className="text-shadow-400 text-sm mb-4 line-clamp-3">{update.summary}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex gap-2">
                            {(update.tags || []).map(tag => (
                                <span key={tag} className="text-[10px] px-2 py-1 bg-shadow-800 rounded-full text-shadow-300 border border-shadow-700">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <button className="text-shadow-500 hover:text-white transition-colors">
                            <ExternalLink size={16} />
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};