export interface UserProfile {
  name: string;
  interests: string[];
  goal: string;
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
  source: string;
  date: string;
  tags: string[];
}

export interface Task {
  id: number;
  text: string; // Changed from title to text to match usage
  completed: boolean;
  category: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
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
}

export interface AppContextType {
  tasks: Task[];
  addTask: (text: string, category?: string) => void;
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;
  preferences: CompanionPreferences;
  updatePreferences: (prefs: Partial<CompanionPreferences>) => void;
  isVoiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
}
