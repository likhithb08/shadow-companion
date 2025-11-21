
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { AppContextType, Task, CompanionPreferences, AutomationWorkflow, User } from '../types';
import { Storage } from '../utils/storage';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [preferences, setPreferences] = useState<CompanionPreferences>(Storage.getUserData('default').preferences);
  const [isVoiceActive, setVoiceActive] = useState(false);

  // 1. Initialize Session on Mount
  useEffect(() => {
    const sessionUser = Storage.getSession();
    if (sessionUser) {
      setUser(sessionUser);
      loadUserData(sessionUser.id);
    }
    setIsLoading(false);
  }, []);

  // 2. Load User Data Helper
  const loadUserData = (userId: string) => {
    const data = Storage.getUserData(userId);
    setTasks(data.tasks);
    setWorkflows(data.workflows);
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
      Storage.saveUserData(user.id, { workflows });
    }
  }, [workflows, user]);

  useEffect(() => {
    if (user) {
      Storage.saveUserData(user.id, { preferences });
    }
  }, [preferences, user]);


  // --- Auth Methods ---
  const login = useCallback(async (email: string, pass: string) => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    
    const existingUser = Storage.findUser(email);
    if (existingUser && existingUser.password === pass) {
      const safeUser = { ...existingUser };
      delete safeUser.password; // Don't store password in session
      
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
      password: pass
    };

    Storage.saveUser(newUser);
    
    // Auto login
    const safeUser = { ...newUser };
    delete safeUser.password;
    
    setUser(safeUser);
    Storage.setSession(safeUser);
    // Initialize default data in storage automatically via the effects
    setTasks(Storage.getUserData('default').tasks); 
    setWorkflows(Storage.getUserData('default').workflows);
    setPreferences({ ...Storage.getUserData('default').preferences, userName: name });
    
    return true;
  }, []);

  const logout = useCallback(() => {
    Storage.clearSession();
    setUser(null);
    setVoiceActive(false);
  }, []);


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

  const addWorkflow = useCallback((title: string, desc: string) => {
    setWorkflows(prev => [...prev, {
      id: Date.now(),
      title,
      desc,
      status: 'Active',
      iconName: 'Zap'
    }]);
  }, []);

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
      tasks,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      workflows,
      addWorkflow,
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
