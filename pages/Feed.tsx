import React, { useState } from 'react';
import { MessageSquare, Heart, Share2, MoreHorizontal } from 'lucide-react';

const MOCK_POSTS = [
    {
        id: 1,
        author: "Sarah Dev",
        handle: "@sarahcodes",
        avatar: "https://picsum.photos/seed/sarah/40/40",
        content: "Just tested the new Gemini 2.5 Live API. The latency is incredibly low! It actually feels like talking to a real person. Building a therapy bot with it this weekend. 🤖✨",
        likes: 420,
        comments: 32,
        time: "2h ago",
        tag: "Development"
    },
    {
        id: 2,
        author: "Alex AI",
        handle: "@alex_ai_research",
        avatar: "https://picsum.photos/seed/alex/40/40",
        content: "The shift from LLMs to autonomous agents is happening faster than we predicted. My new automation workflow just negotiated a refund for me without any human intervention. Wild.",
        likes: 1205,
        comments: 89,
        time: "4h ago",
        tag: "Agents"
    },
    {
        id: 3,
        author: "Design Bot",
        handle: "@ui_ux_ai",
        avatar: "https://picsum.photos/seed/design/40/40",
        content: "Generative UI is the next frontier. Imagine an interface that adapts to your mood and current task in real-time. That's what I'm working on with Shadow Companion.",
        likes: 85,
        comments: 12,
        time: "6h ago",
        tag: "Design"
    }
];

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState(MOCK_POSTS);

  const handleLike = (id: number) => {
      setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Community Feed</h2>
        <div className="flex gap-2">
            {['Trending', 'New', 'Following'].map(filter => (
                <button key={filter} className="px-3 py-1 text-sm rounded-full bg-shadow-900 border border-shadow-800 hover:border-shadow-600 transition-colors">
                    {filter}
                </button>
            ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Create Post Input */}
        <div className="bg-shadow-900 border border-shadow-800 p-4 rounded-xl mb-8">
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-accent-600 flex items-center justify-center font-bold">ME</div>
                <input 
                    type="text" 
                    placeholder="Share your AI journey..." 
                    className="bg-transparent flex-1 outline-none text-shadow-100 placeholder-shadow-500"
                />
            </div>
            <div className="flex justify-end mt-3">
                <button className="bg-white text-black px-4 py-1.5 rounded-lg font-medium text-sm hover:bg-shadow-200 transition-colors">
                    Post
                </button>
            </div>
        </div>

        {/* Feed Posts */}
        {posts.map(post => (
            <article key={post.id} className="bg-shadow-900 border border-shadow-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full" />
                        <div>
                            <h3 className="font-bold text-sm">{post.author}</h3>
                            <p className="text-xs text-shadow-400">{post.handle} • {post.time}</p>
                        </div>
                    </div>
                    <button className="text-shadow-500 hover:text-white">
                        <MoreHorizontal size={18} />
                    </button>
                </div>

                <p className="text-shadow-200 mb-4 leading-relaxed">
                    {post.content}
                </p>

                <div className="flex items-center gap-6 pt-4 border-t border-shadow-800 text-shadow-400 text-sm">
                    <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 hover:text-pink-500 transition-colors group">
                        <Heart size={18} className="group-hover:fill-pink-500" />
                        <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                        <MessageSquare size={18} />
                        <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-green-400 transition-colors">
                        <Share2 size={18} />
                    </button>
                    {post.tag && (
                        <span className="ml-auto text-xs px-2 py-1 bg-shadow-800 rounded text-shadow-300">
                            #{post.tag}
                        </span>
                    )}
                </div>
            </article>
        ))}
      </div>
    </div>
  );
};