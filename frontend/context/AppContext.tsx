
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { AppContextType, Task, CompanionPreferences, User, FeedPost, Friend, DirectMessage, ActivityLog, ActivityType, FocusState, ChatMessage } from '../types';
import { Storage, MOCK_FRIENDS } from '../utils/storage';
import { generatePersonaReply } from '../services/gemini';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [preferences, setPreferences] = useState<CompanionPreferences>(Storage.getUserData('default').preferences);
  const [posts, setPosts] = useState<FeedPost[]>([]); 
  const [isVoiceActive, setVoiceActive] = useState(false);

  // --- Messaging State ---
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [directMessages, setDirectMessages] = useState<Record<string, DirectMessage[]>>({});

  // --- Behavior & Focus State ---
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [focusState, setFocusState] = useState<FocusState>({
    isActive: false,
    taskId: null,
    startTime: 0,
    durationMinutes: 25,
    isPaused: false
  });
  
  // System Message Event Emitter
  const addSystemMessage = useCallback((text: string) => {
      const event = new CustomEvent('shadow-system-message', { detail: text });
      window.dispatchEvent(event);
  }, []);

  // 1. Initialize Session on Mount
  useEffect(() => {
    const sessionUser = Storage.getSession();
    if (sessionUser) {
      setUser(sessionUser);
      loadUserData(sessionUser.id);
    }
    setPosts(Storage.getFeed());
    setDirectMessages(Storage.getMessages());
    setIsLoading(false);
  }, []);

  // 2. Load User Data Helper
  const loadUserData = (userId: string) => {
    const data = Storage.getUserData(userId);
    setTasks(data.tasks);
    setPreferences(data.preferences);
  };

  // 3. Auto-Save Effects
  useEffect(() => {
    if (user) {
      Storage.saveUserData(user.id, { tasks });
    }
  }, [tasks, user]);

  useEffect(() => {
    if (user) {
      Storage.saveUserData(user.id, { preferences });
    }
  }, [preferences, user]);

  useEffect(() => {
    Storage.saveFeed(posts);
  }, [posts]);


  // --- Auth Methods ---
  const login = useCallback(async (email: string, pass: string) => {
    await new Promise(r => setTimeout(r, 800));
    const existingUser = Storage.findUser(email);
    if (existingUser && existingUser.password === pass) {
      const safeUser = { ...existingUser };
      setUser(safeUser);
      Storage.setSession(safeUser);
      loadUserData(safeUser.id);
      logActivity('app-open', 'User logged in');
      return true;
    }
    return false;
  }, []);

  const signup = useCallback(async (email: string, pass: string, name: string) => {
    await new Promise(r => setTimeout(r, 800));
    if (Storage.findUser(email)) return false;
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password: pass,
      age: 0,
      location: 'Unknown Region',
      nationality: 'Global Citizen',
      language: 'English',
      appLanguage: 'English',
      creditsUsed: 0,
      avatarSeed: name,
      focusStreak: 0
    };
    Storage.saveUser(newUser);
    const safeUser = { ...newUser };
    setUser(safeUser);
    Storage.setSession(safeUser);
    setTasks(Storage.getUserData('default').tasks); 
    setPreferences({ ...Storage.getUserData('default').preferences, userName: name });
    logActivity('app-open', 'User signed up');
    return true;
  }, []);

  const logout = useCallback(() => {
    Storage.clearSession();
    setUser(null);
    setVoiceActive(false);
  }, []);

  const updateUserProfile = useCallback((updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    Storage.setSession(updatedUser); 
    Storage.updateUser(updatedUser); 
  }, [user]);


  // --- Data Handlers ---
  const addTask = useCallback((text: string, category: string = "General") => {
    setTasks(prev => [...prev, { id: Date.now(), text, completed: false, category }]);
    logActivity('task-start', `Created task: ${text}`);
  }, []);

  const updateTask = useCallback((id: number, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    logActivity('task-update', `Updated task ${id}`);
  }, []);

  const toggleTask = useCallback((id: number) => {
    setTasks(prev => prev.map(t => {
        if (t.id === id) {
            logActivity(t.completed ? 'task-update' : 'task-complete', `Toggled task ${id}`);
            return { ...t, completed: !t.completed };
        }
        return t;
    }));
  }, []);

  const deleteTask = useCallback((id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    logActivity('task-update', `Deleted task ${id}`);
  }, []);


  // --- Social Feed Handlers ---
  const addPost = useCallback((content: string, tag: string = "General") => {
    if (!user) return;
    const newPost: FeedPost = {
      id: Date.now(),
      author: user.name,
      handle: `@${user.name.toLowerCase().replace(/\s/g, '_')}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed || user.name}`,
      content,
      likes: 0,
      comments: [],
      timestamp: Date.now(),
      category: tag as any
    };
    setPosts(prev => [newPost, ...prev]);
    updateUserProfile({ creditsUsed: (user.creditsUsed || 0) + 5 });
    logActivity('task-update', 'Posted to feed');
  }, [user, updateUserProfile]);

  const deletePost = useCallback((id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggleLike = useCallback((id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  }, []);

  const addComment = useCallback((postId: number, text: string) => {
    if (!user) return;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, {
            id: Date.now().toString(),
            author: user.name,
            text,
            timestamp: Date.now()
          }]
        };
      }
      return p;
    }));
    logActivity('task-update', 'Commented on post');
  }, [user]);

  // --- Direct Message Handlers ---
  const sendDirectMessage = useCallback(async (friendId: string, text: string) => {
    if (!user) return;
    const userMsg: DirectMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      receiverId: friendId,
      text,
      timestamp: Date.now(),
      isRead: true
    };
    Storage.saveMessage(friendId, userMsg);
    setDirectMessages(prev => ({
      ...prev,
      [friendId]: [...(prev[friendId] || []), userMsg]
    }));
    
    // AI Reply Logic
    const friend = friends.find(f => f.id === friendId);
    if (!friend) return;
    const delay = 2000 + Math.random() * 3000;
    setTimeout(async () => {
        const replyText = await generatePersonaReply(friend.personaPrompt, text);
        const replyMsg: DirectMessage = {
          id: (Date.now() + 1).toString(),
          senderId: friendId,
          receiverId: 'me',
          text: replyText,
          timestamp: Date.now(),
          isRead: false
        };
        Storage.saveMessage(friendId, replyMsg);
        setDirectMessages(prev => ({
          ...prev,
          [friendId]: [...(prev[friendId] || []), replyMsg]
        }));
    }, delay);
  }, [user, friends]);

  const updatePreferences = useCallback((prefs: Partial<CompanionPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  }, []);

  const handleSetVoiceActive = useCallback((active: boolean) => {
    setVoiceActive(active);
  }, []);

  // --- Behavior & Focus Logic ---
  const logActivity = useCallback((action: ActivityType, details?: string) => {
    const log: ActivityLog = {
      timestamp: Date.now(),
      action,
      details
    };
    setActivityLog(prev => [...prev.slice(-99), log]); // Keep last 100
  }, []);

  const startFocusMode = useCallback((taskId: number | null, minutes: number) => {
    setVoiceActive(false);
    setFocusState({
      isActive: true,
      taskId,
      startTime: Date.now(),
      durationMinutes: minutes,
      isPaused: false
    });
    logActivity('timer-start', `Started focus mode: ${minutes}m`);
  }, [logActivity]);

  const stopFocusMode = useCallback((completed: boolean) => {
    const duration = focusState.durationMinutes;
    setFocusState(prev => ({ ...prev, isActive: false }));
    
    let details = 'Focus session aborted';
    
    if (user) {
        let newStreak = user.focusStreak || 0;
        let pointsEarned = 0;

        if (completed) {
            newStreak += 1;
            // Reward: 2 points per minute + 5 points per streak level
            pointsEarned = (duration * 2) + (newStreak * 5); 
            
            updateUserProfile({ 
                creditsUsed: (user.creditsUsed || 0) + pointsEarned,
                focusStreak: newStreak
            });
            
            details = `Focus session completed. Streak: ${newStreak}`;
            
            // Construct AI Summary (Voice/Text)
            let summary = `Session Complete! You earned ${pointsEarned} Credits. `;
            if (newStreak > 1) summary += `Current Streak: ${newStreak} sessions. `;
            
            if (duration >= 90) summary += "Incredible Flow State verified. System optimal.";
            else if (duration >= 45) summary += "Deep Work session recorded. Cognitive load stable.";
            else summary += "Target objective secured. Well done.";
            
            addSystemMessage(summary);

        } else {
            // Reset streak on give up
            if (newStreak > 0) {
                 addSystemMessage(`Focus broken. Streak of ${newStreak} lost.`);
            }
            newStreak = 0;
            updateUserProfile({ focusStreak: 0 });
            details = 'Focus session aborted. Streak reset.';
        }
    }
    
    logActivity(completed ? 'timer-stop' : 'focus-break', details);
  }, [logActivity, user, updateUserProfile, focusState.durationMinutes, addSystemMessage]);


  if (isLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Shadow OS...</div>;
  }

  return (
    <AppContext.Provider value={{
      user,
      login,
      signup,
      logout,
      updateUserProfile,
      tasks,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      posts,
      addPost,
      deletePost,
      toggleLike,
      addComment,
      friends,
      directMessages,
      sendDirectMessage,
      preferences,
      updatePreferences,
      isVoiceActive,
      setVoiceActive: handleSetVoiceActive,
      
      // Behavior & Focus
      activityLog,
      logActivity,
      focusState,
      startFocusMode,
      stopFocusMode,
      addSystemMessage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
