import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AppContextType, Task, CompanionPreferences } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Task State
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: "Review latest LLM papers", completed: false, category: "Study" },
    { id: 2, text: "Implement Gemini Live audio hooks", completed: true, category: "Work" },
    { id: 3, text: "Gym session - Cardio", completed: false, category: "Health" }
  ]);

  // Companion Preferences State
  const [preferences, setPreferences] = useState<CompanionPreferences>({
    voiceName: 'Fenrir',
    userName: 'User',
    systemInstruction: "You are Shadow, a helpful, intelligent, and slightly mysterious personal AI companion. You are concise, witty, and focused on helping the user be productive and informed. You have full access to control the app interface via tools."
  });

  // Global Voice State
  const [isVoiceActive, setVoiceActive] = useState(false);

  const addTask = useCallback((text: string, category: string = "General") => {
    setTasks(prev => [...prev, { id: Date.now(), text, completed: false, category }]);
  }, []);

  const toggleTask = useCallback((id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const deleteTask = useCallback((id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const updatePreferences = useCallback((prefs: Partial<CompanionPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  }, []);

  const handleSetVoiceActive = useCallback((active: boolean) => {
    setVoiceActive(active);
  }, []);

  return (
    <AppContext.Provider value={{
      tasks,
      addTask,
      toggleTask,
      deleteTask,
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