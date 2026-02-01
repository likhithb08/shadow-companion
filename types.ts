
export interface UserProfile {
  name: string;
  interests: string[];
  goal: string;
}

export interface EgoStats {
  focus: number;
  discipline: number;
  skill: number;
  speed: number;
  creativity: number;
  mentalStrength: number;
}

export interface EgoTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface SkillTest {
  question: string;
  type: 'scenario' | 'technical' | 'logic';
}

export interface EgoEvolutionState {
  targetStat: keyof EgoStats | null;
  customSkill?: string | null;
  reductionAmount: number;
  tasks: EgoTask[];
  awaitingTest: boolean;
  test?: SkillTest | null;
  testResult?: {
    passed: boolean;
    feedback: string;
  } | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; 
  age?: number;
  location?: string;
  nationality?: string;
  language?: string;
  appLanguage?: string;
  creditsUsed?: number;
  avatarSeed?: string;
  focusStreak?: number;
  egoStats: EgoStats;
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

export interface Friend {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  personaPrompt: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  isRead: boolean;
}

export interface FocusState {
  isActive: boolean;
  taskId: number | null;
  startTime: number;
  durationMinutes: number;
  isPaused: boolean;
}

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
  
  posts: FeedPost[];
  addPost: (content: string, tag: string) => void;
  deletePost: (id: number) => void;
  toggleLike: (id: number) => void;
  addComment: (postId: number, text: string) => void;

  friends: Friend[];
  directMessages: Record<string, DirectMessage[]>;
  sendDirectMessage: (friendId: string, text: string) => void;

  preferences: CompanionPreferences;
  updatePreferences: (prefs: Partial<CompanionPreferences>) => void;
  
  isVoiceActive: boolean;
  setVoiceActive: (active: boolean) => void;

  focusState: FocusState;
  startFocusMode: (taskId: number | null, minutes: number) => void;
  stopFocusMode: (completed: boolean) => void;
  
  // Growth System
  egoEvolution: EgoEvolutionState;
  activateDevourMode: (stat: keyof EgoStats) => void;
  activateSkillAwakening: (skill: string) => Promise<void>;
  toggleEgoTask: (taskId: string) => void;
  submitTestAnswer: (answer: string) => Promise<void>;
  cancelDevourMode: () => void;
}
