
import { Task, CompanionPreferences, User, FeedPost, Friend, DirectMessage } from '../types';

const USERS_KEY = 'shadow_db_users';
const SESSION_KEY = 'shadow_session';
const DATA_PREFIX = 'shadow_data_';
const FEED_KEY = 'shadow_social_feed'; // Global feed key
const DM_KEY = 'shadow_direct_messages'; // Chat storage

interface UserData {
  tasks: Task[];
  preferences: CompanionPreferences;
}

const DEFAULT_PREFS: CompanionPreferences = {
  voiceName: 'Fenrir',
  userName: 'User',
  systemInstruction: "You are Shadow, a helpful, intelligent, and slightly mysterious personal AI companion. You are concise, witty, and focused on helping the user be productive and informed. You have full access to control the app interface via tools.",
  autoSpeak: false
};

const DEFAULT_DATA: UserData = {
  tasks: [
    { id: 1, text: "Review latest LLM papers", completed: false, category: "Study" },
    { id: 2, text: "Implement Gemini Live audio hooks", completed: true, category: "Work" }
  ],
  preferences: DEFAULT_PREFS
};

const MOCK_FEED: FeedPost[] = [
    {
        id: 1,
        author: "Sarah Dev",
        handle: "@sarahcodes",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        content: "Just tested the new Gemini 2.5 Live API. The latency is incredibly low! It actually feels like talking to a real person. Building a therapy bot with it this weekend. 🤖✨",
        likes: 420,
        comments: [],
        timestamp: Date.now() - 7200000, // 2 hours ago
        category: "General"
    },
    {
        id: 2,
        author: "Alex AI",
        handle: "@alex_ai_research",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        content: "The shift from LLMs to autonomous agents is happening faster than we predicted. My new automation workflow just negotiated a refund for me without any human intervention. Wild.",
        likes: 1205,
        comments: [],
        timestamp: Date.now() - 14400000, // 4 hours ago
        category: "General"
    }
];

export const MOCK_FRIENDS: Friend[] = [
  {
    id: 'f1',
    name: 'Sarah Dev',
    handle: '@sarahcodes',
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    status: 'online',
    personaPrompt: "You are Sarah, an enthusiastic software engineer who loves React and AI. You use emojis often."
  },
  {
    id: 'f2',
    name: 'Alex AI',
    handle: '@alex_ai_research',
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    status: 'busy',
    personaPrompt: "You are Alex, a serious AI researcher. You talk about papers, benchmarks, and AGI. You are skeptical but hopeful."
  },
  {
    id: 'f3',
    name: 'Neon Ghost',
    handle: '@neon_runner',
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=neon",
    status: 'offline',
    personaPrompt: "You are a cyberpunk hacker. You speak in riddles and tech slang."
  }
];

export const Storage = {
  // --- Auth Helpers ---
  getUsers: (): User[] => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  },

  saveUser: (user: User) => {
    const users = Storage.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  updateUser: (updatedUser: User) => {
    const users = Storage.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  findUser: (email: string): User | undefined => {
    return Storage.getUsers().find(u => u.email === email);
  },

  setSession: (user: User) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  getSession: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  clearSession: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  // --- Data Helpers ---
  getUserData: (userId: string): UserData => {
    const data = localStorage.getItem(`${DATA_PREFIX}${userId}`);
    if (data) {
      return { ...DEFAULT_DATA, ...JSON.parse(data) }; // Merge with default to ensure all keys exist
    }
    return DEFAULT_DATA;
  },

  saveUserData: (userId: string, data: Partial<UserData>) => {
    const current = Storage.getUserData(userId);
    const updated = { ...current, ...data };
    localStorage.setItem(`${DATA_PREFIX}${userId}`, JSON.stringify(updated));
  },

  // --- Global Feed Helpers ---
  getFeed: (): FeedPost[] => {
    const data = localStorage.getItem(FEED_KEY);
    return data ? JSON.parse(data) : MOCK_FEED;
  },

  saveFeed: (posts: FeedPost[]) => {
    localStorage.setItem(FEED_KEY, JSON.stringify(posts));
  },

  // --- DM Helpers ---
  getMessages: (): Record<string, DirectMessage[]> => {
    const data = localStorage.getItem(DM_KEY);
    return data ? JSON.parse(data) : {};
  },

  saveMessage: (friendId: string, msg: DirectMessage) => {
    const all = Storage.getMessages();
    if (!all[friendId]) all[friendId] = [];
    all[friendId].push(msg);
    localStorage.setItem(DM_KEY, JSON.stringify(all));
  }
};