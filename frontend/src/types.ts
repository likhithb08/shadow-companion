
export interface UserProfile {
  name: string;
  interests: string[];
  goal: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Only for internal checking, usually don't expose in context
}

export interface FeedPost {
  id: string;
  author: string;
  content: string;
  likes: number;
  timestamp: string;
  category: 'News' | 'Opinion' | 'Tool';
}

export interface AIUpdate {
  id: string;
  title: string;
  summary: string;
  content?: string; // Detailed body text
  source: string;
  date: string;
  tags: string[];
}

export interface Task {
  id: number;
  text: string; 
  completed: boolean;
  category: string;
}

export interface AutomationWorkflow {
  id: number;
  title: string;
  desc: string;
  status: 'Active' | 'Paused' | 'Error';
  iconName: 'Mail' | 'MessageSquare' | 'AlertCircle' | 'Zap';
}

// Audio Types for Live API
export interface AudioConfig {
  sampleRate: number;
  channels: number;
}

export type LiveStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Context Types
export interface CompanionPreferences {
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  systemInstruction: string;
  userName: string;
  autoSpeak: boolean;
}

export interface AppContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string, name: string) => Promise<boolean>;
  logout: () => void;

  tasks: Task[];
  addTask: (text: string, category?: string) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;
  
  workflows: AutomationWorkflow[];
  addWorkflow: (title: string, desc: string) => void;

  preferences: CompanionPreferences;
  updatePreferences: (prefs: Partial<CompanionPreferences>) => void;
  
  isVoiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isToolOutput?: boolean;
}
