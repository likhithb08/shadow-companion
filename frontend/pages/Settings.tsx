import React, { useState } from 'react';
import { User, Mail, MapPin, Globe, Flag, Languages, Save, CreditCard, CheckSquare, Users, FileText, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Settings: React.FC = () => {
  const { user, updateUserProfile, tasks, posts } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for form handling
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || 0,
    location: user?.location || '',
    nationality: user?.nationality || '',
    language: user?.language || 'English',
    appLanguage: user?.appLanguage || 'English'
  });

  // Calculate Stats
  const tasksCompleted = tasks.filter(t => t.completed).length;
  const postsCreated = posts.filter(p => p.author === user?.name).length;
  const followers = postsCreated * 12 + (user?.creditsUsed || 0); // Mock calculation based on activity

  const handleSave = () => {
    updateUserProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-shadow-800 pb-4">
            <div>
                <h2 className="text-2xl font-bold tracking-widest uppercase flex items-center gap-3">
                    <Shield className="text-accent-500" />
                    Operative Profile
                </h2>
                <p className="text-shadow-400 text-sm mt-1 font-mono">Configuration // Identity // Statistics</p>
            </div>
            <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`flex items-center gap-2 px-6 py-2 rounded text-sm font-bold uppercase tracking-wider transition-all ${
                    isEditing 
                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                    : 'bg-shadow-800 hover:bg-shadow-700 text-shadow-300 border border-shadow-600'
                }`}
            >
                <Save size={16} />
                {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
        </div>

        {/* Stats Grid (HUD Style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'Credits Used', value: user?.creditsUsed || 0, icon: CreditCard, color: 'text-yellow-400' },
                { label: 'Tasks Done', value: tasksCompleted, icon: CheckSquare, color: 'text-green-400' },
                { label: 'Reputation', value: followers, icon: Users, color: 'text-accent-400' }, // Mock Followers
                { label: 'Transmissions', value: postsCreated, icon: FileText, color: 'text-cyan-400' },
            ].map((stat, i) => (
                <div key={i} className="bg-shadow-900/50 border border-shadow-800 p-4 relative group hover:border-shadow-600 transition-all clip-corner-tr">
                    <div className="flex justify-between items-start mb-2">
                        <stat.icon className={`${stat.color} opacity-80`} size={20} />
                        <div className="text-[10px] text-shadow-600 font-mono uppercase tracking-widest">Stat.{i+1}</div>
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">{stat.value}</div>
                    <div className="text-xs text-shadow-500 uppercase tracking-wider mt-1">{stat.label}</div>
                    {/* Hover glow */}
                    <div className={`absolute inset-0 bg-${stat.color.replace('text-', '')}/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Identity Module */}
            <div className="bg-shadow-900/30 border border-shadow-800 p-6 relative">
                <h3 className="text-sm font-bold text-accent-400 uppercase tracking-widest mb-6 border-b border-shadow-800/50 pb-2">
                    Identity Matrix
                </h3>
                
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] text-shadow-500 uppercase font-bold tracking-wider flex items-center gap-2">
                            <User size={12} /> Designation (Name)
                        </label>
                        <input 
                            type="text" 
                            disabled={!isEditing}
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-black/40 border border-shadow-700 rounded px-4 py-2 text-sm text-white outline-none focus:border-accent-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-shadow-500 uppercase font-bold tracking-wider flex items-center gap-2">
                            <Mail size={12} /> Comm Link (Email)
                        </label>
                        <input 
                            type="email" 
                            disabled={!isEditing}
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-black/40 border border-shadow-700 rounded px-4 py-2 text-sm text-white outline-none focus:border-accent-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-shadow-500 uppercase font-bold tracking-wider flex items-center gap-2">
                            <User size={12} /> Chrono Age
                        </label>
                        <input 
                            type="number" 
                            disabled={!isEditing}
                            value={formData.age}
                            onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                            className="w-full bg-black/40 border border-shadow-700 rounded px-4 py-2 text-sm text-white outline-none focus:border-accent-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                        />
                    </div>
                </div>
            </div>

            {/* Localization Module */}
            <div className="bg-shadow-900/30 border border-shadow-800 p-6 relative">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-6 border-b border-shadow-800/50 pb-2">
                    Geo-Localization
                </h3>
                
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] text-shadow-500 uppercase font-bold tracking-wider flex items-center gap-2">
                            <MapPin size={12} /> Sector / Region
                        </label>
                        <input 
                            type="text" 
                            disabled={!isEditing}
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            placeholder="Unknown Sector"
                            className="w-full bg-black/40 border border-shadow-700 rounded px-4 py-2 text-sm text-white outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-shadow-500 uppercase font-bold tracking-wider flex items-center gap-2">
                            <Flag size={12} /> Origin (Nationality)
                        </label>
                        <input 
                            type="text" 
                            disabled={!isEditing}
                            value={formData.nationality}
                            onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                            placeholder="Global Citizen"
                            className="w-full bg-black/40 border border-shadow-700 rounded px-4 py-2 text-sm text-white outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                        />
                    </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-shadow-500 uppercase font-bold tracking-wider flex items-center gap-2">
                                <Languages size={12} /> Spoken Lang
                            </label>
                            <input 
                                type="text" 
                                disabled={!isEditing}
                                value={formData.language}
                                onChange={(e) => setFormData({...formData, language: e.target.value})}
                                className="w-full bg-black/40 border border-shadow-700 rounded px-4 py-2 text-sm text-white outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-shadow-500 uppercase font-bold tracking-wider flex items-center gap-2">
                                <Globe size={12} /> System Lang
                            </label>
                             <select 
                                disabled={!isEditing}
                                value={formData.appLanguage}
                                onChange={(e) => setFormData({...formData, appLanguage: e.target.value})}
                                className="w-full bg-black/40 border border-shadow-700 rounded px-4 py-2 text-sm text-white outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono appearance-none"
                             >
                                <option>English</option>
                                <option>Spanish</option>
                                <option>French</option>
                                <option>Japanese</option>
                                <option>German</option>
                             </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Decor */}
        <div className="text-center pt-8 opacity-50">
             <div className="text-[10px] text-shadow-600 uppercase tracking-[0.5em]">End of Record</div>
             <div className="w-32 h-1 bg-shadow-800 mx-auto mt-2"></div>
        </div>
    </div>
  );
};