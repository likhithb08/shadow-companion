
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { AppContextType, Task, CompanionPreferences, User, FeedPost, Friend, DirectMessage, ActivityLog, ActivityType, FocusState, EgoStats, EgoEvolutionState, EgoTask } from '../types';
import { Storage, MOCK_FRIENDS } from '../utils/storage';
import { generatePersonaReply } from '../services/gemini';

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_STATS: EgoStats = {
  focus: 50,
  discipline: 50,
  skill: 50,
  speed: 50,
  creativity: 50,
  mentalStrength: 50
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [preferences, setPreferences] = useState<CompanionPreferences>(Storage.getUserData('default').preferences);
  const [posts, setPosts] = useState<FeedPost[]>([]); 
  const [isVoiceActive, setVoiceActive] = useState(false);
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [directMessages, setDirectMessages] = useState<Record<string, DirectMessage[]>>({});
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [focusState, setFocusState] = useState<FocusState>({
    isActive: false,
    taskId: null,
    startTime: 0,
    durationMinutes: 25,
    isPaused: false
  });

  // Ego Evolution State
  const [egoEvolution, setEgoEvolution] = useState<EgoEvolutionState>({
    targetStat: null,
    reductionAmount: 10,
    tasks: []
  });

  const addSystemMessage = useCallback((text: string) => {
      const event = new CustomEvent('shadow-system-message', { detail: text });
      window.dispatchEvent(event);
  }, []);

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

  const loadUserData = (userId: string) => {
    const data = Storage.getUserData(userId);
    setTasks(data.tasks);
    setPreferences(data.preferences);
  };

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

  const logActivity = useCallback((action: ActivityType, details?: string) => {
    const log: ActivityLog = { timestamp: Date.now(), action, details };
    setActivityLog(prev => [...prev.slice(-99), log]);
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    await new Promise(r => setTimeout(r, 800));
    const existingUser = Storage.findUser(email);
    if (existingUser && existingUser.password === pass) {
      const safeUser = { ...existingUser, egoStats: existingUser.egoStats || INITIAL_STATS };
      setUser(safeUser);
      Storage.setSession(safeUser);
      loadUserData(safeUser.id);
      logActivity('app-open', 'User logged in');
      return true;
    }
    return false;
  }, [logActivity]);

  const signup = useCallback(async (email: string, pass: string, name: string) => {
    await new Promise(r => setTimeout(r, 800));
    if (Storage.findUser(email)) return false;
    const newUser: User = {
      id: Date.now().toString(),
      name, email, password: pass,
      age: 0, location: 'Unknown Region', nationality: 'Global Citizen',
      language: 'English', appLanguage: 'English',
      creditsUsed: 0, avatarSeed: name, focusStreak: 0,
      egoStats: INITIAL_STATS
    };
    Storage.saveUser(newUser);
    setUser(newUser);
    Storage.setSession(newUser);
    setTasks(Storage.getUserData('default').tasks); 
    setPreferences({ ...Storage.getUserData('default').preferences, userName: name });
    logActivity('app-open', 'User signed up');
    return true;
  }, [logActivity]);

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

  const addTask = useCallback((text: string, category: string = "General") => {
    setTasks(prev => [...prev, { id: Date.now(), text, completed: false, category }]);
    logActivity('task-start', `Created task: ${text}`);
  }, [logActivity]);

  const updateTask = useCallback((id: number, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    logActivity('task-update', `Updated task ${id}`);
  }, [logActivity]);

  const toggleTask = useCallback((id: number) => {
    setTasks(prev => prev.map(t => {
        if (t.id === id) {
            logActivity(t.completed ? 'task-update' : 'task-complete', `Toggled task ${id}`);
            return { ...t, completed: !t.completed };
        }
        return t;
    }));
  }, [logActivity]);

  const deleteTask = useCallback((id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    logActivity('task-update', `Deleted task ${id}`);
  }, [logActivity]);

  const addPost = useCallback((content: string, tag: string = "General") => {
    if (!user) return;
    const newPost: FeedPost = {
      id: Date.now(),
      author: user.name,
      handle: `@${user.name.toLowerCase().replace(/\s/g, '_')}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed || user.name}`,
      content, likes: 0, comments: [], timestamp: Date.now(), category: tag as any
    };
    setPosts(prev => [newPost, ...prev]);
    updateUserProfile({ creditsUsed: (user.creditsUsed || 0) + 5 });
  }, [user, updateUserProfile]);

  const deletePost = useCallback((id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggleLike = useCallback((id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  }, []);

  const addComment = useCallback((postId: number, text: string) => {
    if (!user) return;
    setPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        comments: [...p.comments, { id: Date.now().toString(), author: user.name, text, timestamp: Date.now() }]
    } : p));
  }, [user]);

  const sendDirectMessage = useCallback(async (friendId: string, text: string) => {
    if (!user) return;
    const userMsg: DirectMessage = { id: Date.now().toString(), senderId: 'me', receiverId: friendId, text, timestamp: Date.now(), isRead: true };
    Storage.saveMessage(friendId, userMsg);
    setDirectMessages(prev => ({ ...prev, [friendId]: [...(prev[friendId] || []), userMsg] }));
    const friend = friends.find(f => f.id === friendId);
    if (!friend) return;
    setTimeout(async () => {
        const replyText = await generatePersonaReply(friend.personaPrompt, text);
        const replyMsg: DirectMessage = { id: (Date.now() + 1).toString(), senderId: friendId, receiverId: 'me', text: replyText, timestamp: Date.now(), isRead: false };
        Storage.saveMessage(friendId, replyMsg);
        setDirectMessages(prev => ({ ...prev, [friendId]: [...(prev[friendId] || []), replyMsg] }));
    }, 2000 + Math.random() * 3000);
  }, [user, friends]);

  const updatePreferences = useCallback((prefs: Partial<CompanionPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  }, []);

  const startFocusMode = useCallback((taskId: number | null, minutes: number) => {
    setVoiceActive(false);
    setFocusState({ isActive: true, taskId, startTime: Date.now(), durationMinutes: minutes, isPaused: false });
    logActivity('timer-start', `Started focus mode: ${minutes}m`);
  }, [logActivity]);

  const stopFocusMode = useCallback((completed: boolean) => {
    const duration = focusState.durationMinutes;
    setFocusState(prev => ({ ...prev, isActive: false }));
    if (user && completed) {
        const newStreak = (user.focusStreak || 0) + 1;
        updateUserProfile({ creditsUsed: (user.creditsUsed || 0) + (duration * 2), focusStreak: newStreak });
        addSystemMessage(`Session Complete! Streak: ${newStreak}`);
    }
  }, [user, updateUserProfile, focusState.durationMinutes, addSystemMessage]);

  // Ego Growth Methods
  const activateDevourMode = useCallback((stat: keyof EgoStats) => {
    if (!user) return;
    
    // Generate tasks based on stat
    const taskOptions: Record<keyof EgoStats, string[]> = {
        focus: ["Complete a 45min Flow session", "No notifications for 2 hours", "Read 10 pages of technical documentation"],
        discipline: ["Wake up before 06:30 AM tomorrow", "Zero social media for 24 hours", "Complete all items on today's list"],
        skill: ["Automate one manual workflow", "Learn one new Gemini API function", "Build a small demo component"],
        speed: ["Finish 3 tasks in under 1 hour", "Reply to all unread messages", "Perform 5 minute quick-cleanup"],
        creativity: ["Draft 5 unique feed posts", "Refine existing character persona", "Generate a custom SVG visualization"],
        mentalStrength: ["Complete a session without pausing", "Face a deferred task first thing", "Maintenance check on all systems"]
    };

    const selectedTasks = taskOptions[stat].map(t => ({ id: Math.random().toString(36).substr(2, 9), text: t, completed: false }));

    setEgoEvolution({
        targetStat: stat,
        reductionAmount: 15,
        tasks: selectedTasks
    });

    logActivity('ego-devour', `Targeting stat: ${stat}`);
    addSystemMessage(`EGO MODE: Target [${stat.toUpperCase()}] selected. Prove your worth.`);
  }, [user, logActivity, addSystemMessage]);

  const toggleEgoTask = useCallback((taskId: string) => {
    setEgoEvolution(prev => {
        const newTasks = prev.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
        const allDone = newTasks.every(t => t.completed);

        if (allDone && prev.targetStat) {
            // LEVEL UP LOGIC
            const stat = prev.targetStat;
            const currentVal = user?.egoStats[stat] || 50;
            const newVal = Math.min(100, currentVal + 5); // Restore + 5 bonus
            
            updateUserProfile({
                egoStats: {
                    ...user!.egoStats,
                    [stat]: newVal
                }
            });

            logActivity('ego-levelup', `Stat ${stat} increased to ${newVal}`);
            addSystemMessage(`LEVEL UP! Aura for [${stat.toUpperCase()}] enhanced to ${newVal}.`);
            
            // Exit Devour Mode
            return { targetStat: null, reductionAmount: 0, tasks: [] };
        }

        return { ...prev, tasks: newTasks };
    });
  }, [user, updateUserProfile, logActivity, addSystemMessage]);

  const cancelDevourMode = useCallback(() => {
    setEgoEvolution({ targetStat: null, reductionAmount: 0, tasks: [] });
    logActivity('nav-switch', 'Ego session cancelled');
  }, [logActivity]);

  if (isLoading) return null;

  return (
    <AppContext.Provider value={{
      user, login, signup, logout, updateUserProfile,
      tasks, addTask, updateTask, toggleTask, deleteTask,
      posts, addPost, deletePost, toggleLike, addComment,
      friends, directMessages, sendDirectMessage,
      preferences, updatePreferences, isVoiceActive, setVoiceActive,
      activityLog, logActivity, focusState, startFocusMode, stopFocusMode,
      egoEvolution, activateDevourMode, toggleEgoTask, cancelDevourMode,
      addSystemMessage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
