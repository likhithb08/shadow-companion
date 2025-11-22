
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Heart, Share2, MoreHorizontal, Sparkles, Trash2, Send, Users, MessageCircle, Circle } from 'lucide-react';
import { refineText } from '../services/gemini';
import { useApp } from '../context/AppContext';

// Helper for relative time
const getTimeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const Feed: React.FC = () => {
  const { posts, addPost, toggleLike, addComment, deletePost, user, friends, directMessages, sendDirectMessage } = useApp();
  
  // View Mode (for Mobile mainly, Desktop is split view)
  const [activeTab, setActiveTab] = useState<'feed' | 'comms'>('feed');
  
  // Feed State
  const [newPostText, setNewPostText] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [openCommentsId, setOpenCommentsId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');

  // Chat State
  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeMessages = activeFriendId ? (directMessages[activeFriendId] || []) : [];

  useEffect(() => {
      if (activeTab === 'comms' && activeFriendId) {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
  }, [activeMessages, activeTab, activeFriendId]);

  const handlePolish = async () => {
    if (!newPostText.trim()) return;
    setIsPolishing(true);
    const refined = await refineText(newPostText, "Make it engaging and viral for social media, but keep it authentic.");
    setNewPostText(refined);
    setIsPolishing(false);
  };

  const handlePost = () => {
    if (!newPostText.trim()) return;
    addPost(newPostText, "General");
    setNewPostText('');
  };

  const handleAddComment = (postId: number) => {
    if (!commentText.trim()) return;
    addComment(postId, commentText);
    setCommentText('');
  };

  const handleSendDM = () => {
      if (!activeFriendId || !chatInput.trim()) return;
      sendDirectMessage(activeFriendId, chatInput);
      setChatInput('');
  };

  // -- Components --
  const FeedView = () => (
    <div className="space-y-6">
        {/* Create Post Input */}
        <div className="bg-shadow-900/80 border border-shadow-800 p-5 rounded-2xl relative clip-hud backdrop-blur-sm">
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg">
                    {user?.name.charAt(0) || "U"}
                </div>
                <div className="flex-1 space-y-3">
                    <textarea 
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        placeholder="Broadcast your status..." 
                        rows={2}
                        className="w-full bg-black/30 border border-shadow-800 rounded-lg p-3 outline-none text-shadow-100 placeholder-shadow-600 focus:border-accent-500/50 transition-colors resize-none font-mono text-sm"
                    />
                    <div className="flex justify-between items-center">
                        <button 
                            onClick={handlePolish}
                            disabled={isPolishing || !newPostText}
                            className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50 transition-colors bg-cyan-950/30 px-3 py-1.5 rounded border border-cyan-900/50"
                        >
                            <Sparkles size={14} className={isPolishing ? "animate-spin" : ""} />
                            {isPolishing ? "Refining..." : "AI Polish"}
                        </button>
                        <button 
                            onClick={handlePost}
                            disabled={!newPostText.trim()}
                            className="bg-accent-600 hover:bg-accent-500 text-white px-6 py-1.5 rounded font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:opacity-50 disabled:shadow-none"
                        >
                            Broadcast
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Feed Posts */}
        {posts
          .filter(p => filter === 'All' || (filter === 'My Posts' && p.author === user?.name))
          .map(post => (
            <article key={post.id} className="bg-shadow-900 border border-shadow-800 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full bg-shadow-800" />
                        <div>
                            <h3 className="font-bold text-sm text-white">{post.author}</h3>
                            <p className="text-xs text-shadow-500 font-mono">{post.handle} • {getTimeAgo(post.timestamp)}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {post.author === user?.name && (
                            <button onClick={() => deletePost(post.id)} className="text-shadow-600 hover:text-red-400 transition-colors p-1">
                                <Trash2 size={16} />
                            </button>
                        )}
                        <button className="text-shadow-600 hover:text-white transition-colors p-1">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>
                </div>

                <p className="text-shadow-200 mb-4 leading-relaxed text-sm">
                    {post.content}
                </p>

                <div className="flex items-center gap-6 pt-4 border-t border-shadow-800 text-shadow-400 text-sm">
                    <button 
                        onClick={() => toggleLike(post.id)} 
                        className="flex items-center gap-2 hover:text-pink-500 transition-colors group"
                    >
                        <Heart size={18} className={`transition-all ${post.likes > 0 ? 'group-hover:fill-pink-500' : ''}`} />
                        <span className="font-mono">{post.likes}</span>
                    </button>
                    
                    <button 
                        onClick={() => setOpenCommentsId(openCommentsId === post.id ? null : post.id)}
                        className={`flex items-center gap-2 transition-colors ${openCommentsId === post.id ? 'text-accent-400' : 'hover:text-blue-400'}`}
                    >
                        <MessageSquare size={18} />
                        <span className="font-mono">{post.comments.length}</span>
                    </button>
                    
                    <button className="flex items-center gap-2 hover:text-green-400 transition-colors">
                        <Share2 size={18} />
                    </button>
                </div>

                {/* Comments Section */}
                {openCommentsId === post.id && (
                    <div className="mt-4 pt-4 border-t border-shadow-800 space-y-4 bg-black/20 -mx-6 px-6 pb-2">
                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                            {post.comments.length === 0 && (
                                <p className="text-xs text-shadow-600 italic">No transmissions yet.</p>
                            )}
                            {post.comments.map(comment => (
                                <div key={comment.id} className="flex gap-3 text-sm">
                                    <div className="font-bold text-accent-400 text-xs whitespace-nowrap">{comment.author}:</div>
                                    <div className="text-shadow-300">{comment.text}</div>
                                    <div className="text-[10px] text-shadow-600 ml-auto whitespace-nowrap">{getTimeAgo(comment.timestamp)}</div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="relative flex items-center gap-2 mt-2">
                            <input 
                                type="text" 
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                placeholder="Reply to transmission..."
                                className="flex-1 bg-shadow-950 border border-shadow-700 rounded px-3 py-2 text-xs text-white outline-none focus:border-accent-500 transition-colors"
                            />
                            <button 
                                onClick={() => handleAddComment(post.id)}
                                disabled={!commentText.trim()}
                                className="p-2 bg-shadow-800 text-shadow-400 hover:text-accent-400 hover:bg-shadow-700 rounded transition-colors disabled:opacity-50"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </article>
          ))}
    </div>
  );

  const CommsView = () => (
      <div className="h-[600px] bg-shadow-900/50 border border-shadow-800 rounded-2xl flex overflow-hidden clip-corner-tr">
          {/* Friends List */}
          <div className={`w-1/3 border-r border-shadow-800 bg-black/20 flex flex-col ${activeFriendId && 'hidden md:flex'}`}>
              <div className="p-4 border-b border-shadow-800 bg-shadow-900/50">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-shadow-400 flex items-center gap-2">
                       <Users size={14} /> Contacts
                   </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {friends.map(friend => (
                      <button 
                        key={friend.id}
                        onClick={() => setActiveFriendId(friend.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded transition-all ${
                            activeFriendId === friend.id 
                            ? 'bg-accent-600/20 border border-accent-500/30 text-white' 
                            : 'hover:bg-shadow-800 text-shadow-400'
                        }`}
                      >
                          <div className="relative">
                              <img src={friend.avatar} alt={friend.name} className="w-8 h-8 rounded-full" />
                              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-shadow-900 ${
                                  friend.status === 'online' ? 'bg-green-500' :
                                  friend.status === 'busy' ? 'bg-red-500' : 'bg-shadow-500'
                              }`} />
                          </div>
                          <div className="text-left flex-1 truncate">
                              <p className="text-xs font-bold truncate">{friend.name}</p>
                              <p className="text-[9px] opacity-50 truncate">
                                  {directMessages[friend.id]?.slice(-1)[0]?.text || friend.status}
                              </p>
                          </div>
                      </button>
                  ))}
              </div>
          </div>
          
          {/* Chat Window */}
          <div className={`flex-1 flex flex-col bg-shadow-950/50 ${!activeFriendId && 'hidden md:flex'}`}>
              {activeFriendId ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-shadow-800 flex items-center gap-3 bg-shadow-900/80">
                        <button className="md:hidden text-shadow-400" onClick={() => setActiveFriendId(null)}>
                            ←
                        </button>
                        <img src={friends.find(f => f.id === activeFriendId)?.avatar} className="w-8 h-8 rounded-full" />
                        <div>
                            <h3 className="text-sm font-bold text-white">{friends.find(f => f.id === activeFriendId)?.name}</h3>
                            <p className="text-[10px] text-accent-400 uppercase tracking-widest">Secure Connection</p>
                        </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {activeMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-3 rounded-xl text-xs leading-relaxed ${
                                    msg.senderId === 'me' 
                                    ? 'bg-accent-600 text-white rounded-br-none' 
                                    : 'bg-shadow-800 text-shadow-200 rounded-bl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-shadow-800 flex gap-2 bg-shadow-900/50">
                        <input 
                            className="flex-1 bg-black/40 border border-shadow-700 rounded px-3 py-2 text-xs text-white outline-none focus:border-accent-500 transition-colors"
                            placeholder="Type encrypted message..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendDM()}
                        />
                        <button 
                            onClick={handleSendDM}
                            disabled={!chatInput.trim()}
                            className="p-2 bg-accent-600 text-white rounded hover:bg-accent-500 transition-colors disabled:opacity-50"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                  </>
              ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-shadow-600 gap-4 p-8 text-center">
                      <MessageCircle size={48} className="opacity-20" />
                      <p className="text-xs uppercase tracking-widest">Select a contact to initiate secure link</p>
                  </div>
              )}
          </div>
      </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)] lg:h-auto">
      
      {/* Header (Mobile Only toggle) */}
      <div className="lg:hidden col-span-1 flex gap-2 mb-4">
         <button 
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded border ${
                activeTab === 'feed' 
                ? 'bg-accent-600 border-accent-500 text-white' 
                : 'bg-shadow-900 border-shadow-800 text-shadow-500'
            }`}
         >
            Network Feed
         </button>
         <button 
            onClick={() => setActiveTab('comms')}
             className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded border ${
                activeTab === 'comms' 
                ? 'bg-accent-600 border-accent-500 text-white' 
                : 'bg-shadow-900 border-shadow-800 text-shadow-500'
            }`}
         >
            Comms Link
         </button>
      </div>

      {/* Left Panel: Feed (Visible on Desktop or when Feed Tab Active) */}
      <div className={`lg:col-span-2 overflow-y-auto lg:block custom-scrollbar ${activeTab === 'feed' ? 'block' : 'hidden'}`}>
           {/* Header */}
            <div className="flex items-center justify-between mb-6 pt-2 sticky top-0 bg-shadow-950/95 backdrop-blur z-10 pb-4 border-b border-shadow-800/50">
                <h2 className="text-2xl font-bold">Shadow Network</h2>
                <div className="flex gap-2">
                    {['All', 'My Posts'].map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                filter === f 
                                ? 'bg-accent-600 border-accent-500 text-white' 
                                : 'bg-shadow-900 border-shadow-800 text-shadow-400 hover:border-shadow-600'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>
            <FeedView />
      </div>
      
      {/* Right Panel: Chat (Visible on Desktop or when Comms Tab Active) */}
      <div className={`lg:col-span-1 lg:block h-full ${activeTab === 'comms' ? 'block' : 'hidden'}`}>
          <div className="mb-6 pt-2 flex items-center gap-2 text-shadow-400 lg:mb-10">
               <MessageCircle size={20} />
               <h2 className="text-xl font-bold">Comms</h2>
          </div>
          <CommsView />
      </div>
    </div>
  );
};