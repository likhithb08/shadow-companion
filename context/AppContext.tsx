
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { AppContextType, Task, CompanionPreferences, User, FeedPost, Friend, DirectMessage, FocusState, EgoStats, EgoEvolutionState, EgoTask } from '../types';
import { Storage, MOCK_FRIENDS } from '../utils/storage';
import { generatePersonaReply, generateSkillEvolutionTasks, generateSkillTest, evaluateSkillTest } from '../services/gemini';

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
  const [focusState, setFocusState] = useState<FocusState>({
    isActive: false,
    taskId: null,
    startTime: 0,
    durationMinutes: 25,
    isPaused: false
  });

  const [egoEvolution, setEgoEvolution] = useState<EgoEvolutionState>({
    targetStat: null,
    reductionAmount: 10,
    tasks: [],
    awaitingTest: false
  });

  useEffect(() => {
    const sessionUser = Storage.getSession();
    if (sessionUser) {
      const safeUser = { ...sessionUser, egoStats: sessionUser.egoStats || { ...INITIAL_STATS } };
      setUser(safeUser);
      loadUserData(safeUser.id);
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
    if (user) Storage.saveUserData(user.id, { tasks });
  }, [tasks, user]);

  useEffect(() => {
    if (user) Storage.saveUserData(user.id, { preferences });
  }, [preferences, user]);

  useEffect(() => {
    Storage.saveFeed(posts);
  }, [posts]);

  const login = useCallback(async (email: string, pass: string) => {
    const existingUser = Storage.findUser(email);
    if (existingUser && existingUser.password === pass) {
      const safeUser = { ...existingUser, egoStats: existingUser.egoStats || { ...INITIAL_STATS } };
      setUser(safeUser);
      Storage.setSession(safeUser);
      loadUserData(safeUser.id);
      return true;
    }
    return false;
  }, []);

  const signup = useCallback(async (email: string, pass: string, name: string) => {
    if (Storage.findUser(email)) return false;
    const newUser: User = {
      id: Date.now().toString(),
      name, email, password: pass,
      creditsUsed: 0, avatarSeed: name,
      egoStats: { ...INITIAL_STATS }
    };
    Storage.saveUser(newUser);
    setUser(newUser);
    Storage.setSession(newUser);
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
  }, [user]);

  const deletePost = useCallback((id: number) => setPosts(prev => prev.filter(p => p.id !== id)), []);
  const toggleLike = useCallback((id: number) => setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p)), []);
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
    }, 2000);
  }, [user, friends]);

  const updatePreferences = useCallback((prefs: Partial<CompanionPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  }, []);

  const startFocusMode = useCallback((taskId: number | null, minutes: number) => {
    setVoiceActive(false);
    setFocusState({ isActive: true, taskId, startTime: Date.now(), durationMinutes: minutes, isPaused: false });
  }, []);

  const stopFocusMode = useCallback((completed: boolean) => {
    setFocusState(prev => ({ ...prev, isActive: false }));
  }, []);

  const activateDevourMode = useCallback((stat: keyof EgoStats) => {
    if (!user) return;
    const taskOptions: Record<keyof EgoStats, string[]> = {
        focus: ["Complete 60min Flow session", "Zero distractions for 2 hours", "Organize workspace completely"],
        discipline: ["Wake up before 06:00 AM", "No social media for 24 hours", "Execute morning routine perfectly"],
        skill: ["Analyze 3 high-level gameplays", "Practice core mechanic for 1 hour", "Review technical documentation"],
        speed: ["Finish 5 tasks in record time", "Optimized navigation route executed", "Rapid response session cleared"],
        creativity: ["Draft 3 unconventional strategies", "Generate 5 new creative concepts", "Visual flow architecture designed"],
        mentalStrength: ["Push through 1 high-stress task", "Resolve a deferred conflict", "Maintain calm in disruption"]
    };
    const selectedTasks = taskOptions[stat].map(t => ({ id: Math.random().toString(36).substr(2, 9), text: t, completed: false }));
    setEgoEvolution({ targetStat: stat, reductionAmount: 10, tasks: selectedTasks, awaitingTest: false });
  }, [user]);

  const activateSkillAwakening = useCallback(async (skill: string) => {
    if (!user) return;
    const data = await generateSkillEvolutionTasks(skill);
    const selectedTasks = data.tasks.map(t => ({ id: Math.random().toString(36).substr(2, 9), text: t, completed: false }));
    setEgoEvolution({ 
        targetStat: data.targetStat as keyof EgoStats, 
        customSkill: skill,
        reductionAmount: 15, 
        tasks: selectedTasks,
        awaitingTest: false 
    });
  }, [user]);

  const toggleEgoTask = useCallback(async (taskId: string) => {
    let skillToTest = '';
    setEgoEvolution(prev => {
        const newTasks = prev.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
        const allDone = newTasks.every(t => t.completed);
        
        if (allDone && !prev.awaitingTest) {
            skillToTest = prev.customSkill || prev.targetStat || 'general skill';
            return { ...prev, tasks: newTasks, awaitingTest: true };
        }
        return { ...prev, tasks: newTasks };
    });

    if (skillToTest) {
      const test = await generateSkillTest(skillToTest);
      setEgoEvolution(prev => ({ ...prev, test: test as any }));
    }
  }, []);

  const submitTestAnswer = useCallback(async (answer: string) => {
    if (!user || !egoEvolution.targetStat || !egoEvolution.test) return;
    
    const skillName = egoEvolution.customSkill || egoEvolution.targetStat;
    const result = await evaluateSkillTest(skillName, egoEvolution.test.question, answer);
    
    if (result.passed) {
      const stat = egoEvolution.targetStat;
      const currentVal = user.egoStats[stat] || 50;
      const bonus = egoEvolution.customSkill ? 7 : 3; // Tests give more rewards
      
      updateUserProfile({ egoStats: { ...user.egoStats, [stat]: Math.min(100, currentVal + bonus) } });
      setEgoEvolution(prev => ({ ...prev, testResult: result }));
      
      // Clear after feedback delay
      setTimeout(() => {
        setEgoEvolution({ targetStat: null, customSkill: null, reductionAmount: 0, tasks: [], awaitingTest: false, test: null, testResult: null });
      }, 3000);
    } else {
      setEgoEvolution(prev => ({ ...prev, testResult: result }));
      // Retry tasks after delay
      setTimeout(() => {
        setEgoEvolution(prev => ({ 
          ...prev, 
          tasks: prev.tasks.map(t => ({ ...t, completed: false })), 
          awaitingTest: false, 
          test: null, 
          testResult: null 
        }));
      }, 3000);
    }
  }, [user, egoEvolution, updateUserProfile]);

  const cancelDevourMode = useCallback(() => setEgoEvolution({ targetStat: null, customSkill: null, reductionAmount: 0, tasks: [], awaitingTest: false, test: null, testResult: null }), []);

  if (isLoading) return null;

  return (
    <AppContext.Provider value={{
      user, login, signup, logout, updateUserProfile,
      tasks, addTask, updateTask, toggleTask, deleteTask,
      posts, addPost, deletePost, toggleLike, addComment,
      friends, directMessages, sendDirectMessage,
      preferences, updatePreferences, isVoiceActive, setVoiceActive,
      focusState, startFocusMode, stopFocusMode,
      egoEvolution, activateDevourMode, activateSkillAwakening, toggleEgoTask, submitTestAnswer, cancelDevourMode
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
