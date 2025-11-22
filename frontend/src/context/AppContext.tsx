
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { AppContextType, Task, CompanionPreferences, User, FeedPost, Friend, DirectMessage } from '../types';
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
  const [posts, setPosts] = useState<FeedPost[]>([]); // Social Feed
  const [isVoiceActive, setVoiceActive] = useState(false);

  // --- Messaging State ---
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [directMessages, setDirectMessages] = useState<Record<string, DirectMessage[]>>({});

  // 1. Initialize Session on Mount
  useEffect(() => {
    const sessionUser = Storage.getSession();
    if (sessionUser) {
      setUser(sessionUser);
      loadUserData(sessionUser.id);
    }
    // Always load the global feed regardless of user
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

  // Save Feed changes whenever posts change
  useEffect(() => {
    Storage.saveFeed(posts);
  }, [posts]);


  // --- Auth Methods ---
  const login = useCallback(async (email: string, pass: string) => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    
    const existingUser = Storage.findUser(email);
    if (existingUser && existingUser.password === pass) {
      const safeUser = { ...existingUser };
      // Don't expose password, but we might need it for mock update checking if we were stricter
      // delete safeUser.password; 
      
      setUser(safeUser);
      Storage.setSession(safeUser);
      loadUserData(safeUser.id);
      return true;
    }
    return false;
  }, []);

  const signup = useCallback(async (email: string, pass: string, name: string) => {
    await new Promise(r => setTimeout(r, 800));

    if (Storage.findUser(email)) return false; // Exists

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
      avatarSeed: name
    };

    Storage.saveUser(newUser);
    
    const safeUser = { ...newUser };
    
    setUser(safeUser);
    Storage.setSession(safeUser);
    // Initialize default data
    setTasks(Storage.getUserData('default').tasks); 
    setPreferences({ ...Storage.getUserData('default').preferences, userName: name });
    
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
    Storage.setSession(updatedUser); // Update current session
    Storage.updateUser(updatedUser); // Update DB record
  }, [user]);


  // --- Data Handlers ---
  const addTask = useCallback((text: string, category: string = "General") => {
    setTasks(prev => [...prev, { id: Date.now(), text, completed: false, category }]);
  }, []);

  const updateTask = useCallback((id: number, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const toggleTask = useCallback((id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const deleteTask = useCallback((id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
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
    
    // Increment credits used for "posting" activity (mock)
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
  }, [user]);

  // --- Direct Message Handlers ---
  const sendDirectMessage = useCallback(async (friendId: string, text: string) => {
    if (!user) return;

    // 1. Add User Message
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

    // 2. Trigger AI Reply (Simulated Real-time)
    // Find friend to get persona
    const friend = friends.find(f => f.id === friendId);
    if (!friend) return;

    // Small random delay between 2-5 seconds to simulate typing
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
      setVoiceActive: handleSetVoiceActive
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