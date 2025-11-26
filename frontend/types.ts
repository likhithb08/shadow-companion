
export interface UserProfile {
  name: string;
  interests: string[];
  goal: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; 
  // Extended Profile Fields
  age?: number;
  location?: string; // Place/Area/Region
  nationality?: string;
  language?: string; // Spoken Language
  appLanguage?: string; // UI Language
  creditsUsed?: number;
  avatarSeed?: string;
  focusStreak?: number; // Gamification
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

export interface FeedPost {
  id: number;
  author: string;
  handle: string; 
  avatar?: string; 
  content: string;
  likes: number;
  timestamp: number; 
  category: 'News' | 'Opinion' | 'Tool' | 'General'; 
  comments: Comment[]; 
}

export interface AIUpdate {
  id: string;
  title: string;
  summary: string;
  content?: string; 
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

// --- Chat / Social Types ---
export interface Friend {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  personaPrompt: string; // For AI generation
}

export interface DirectMessage {
  id: string;
  senderId: string; // 'me' or friendId
  receiverId: string;
  text: string;
  timestamp: number;
  isRead: boolean;
}

// Audio Types for Live API
export interface AudioConfig {
  sampleRate: number;
  channels: number;
}

export type LiveStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// --- Behavior & Focus Types ---
export type ActivityType = 'app-open' | 'nav-switch' | 'task-update' | 'task-start' | 'task-complete' | 'timer-start' | 'timer-stop' | 'idle-detected' | 'focus-break';

export interface ActivityLog {
  timestamp: number;
  action: ActivityType;
  details?: string;
}

export interface FocusState {
  isActive: boolean;
  taskId: number | null; // The ONE task being focused on
  startTime: number;
  durationMinutes: number; // 25, 45, 90
  isPaused: boolean;
}

// Context Types
export interface CompanionPreferences {
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  systemInstruction: string;
  userName: string;
  autoSpeak: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isToolOutput?: boolean;
  isSystemNudge?: boolean; // For proactive behavior messages
}

export interface AppContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => void;

  tasks: Task[];
  addTask: (text: string, category?: string) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;
  
  // Social Feed
  posts: FeedPost[];
  addPost: (content: string, tag: string) => void;
  deletePost: (id: number) => void;
  toggleLike: (id: number) => void;
  addComment: (postId: number, text: string) => void;

  // Direct Messaging
  friends: Friend[];
  directMessages: Record<string, DirectMessage[]>; // keyed by Friend ID
  sendDirectMessage: (friendId: string, text: string) => void;

  preferences: CompanionPreferences;
  updatePreferences: (prefs: Partial<CompanionPreferences>) => void;
  
  isVoiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
  
  // Behavior & Focus
  activityLog: ActivityLog[];
  logActivity: (action: ActivityType, details?: string) => void;
  focusState: FocusState;
  startFocusMode: (taskId: number | null, minutes: number) => void;
  stopFocusMode: (completed: boolean) => void;
  
  // Chat Methods (exposed for System Nudges)
  addSystemMessage: (text: string) => void;
  
  // Legacy/Optional if referenced
  workflows?: any[];
  addWorkflow?: any;
}
