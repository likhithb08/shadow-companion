
import { Task, AutomationWorkflow, CompanionPreferences, User } from '../types';

const USERS_KEY = 'shadow_db_users';
const SESSION_KEY = 'shadow_session';
const DATA_PREFIX = 'shadow_data_';

interface UserData {
  tasks: Task[];
  workflows: AutomationWorkflow[];
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
  workflows: [
      { id: 1, title: 'Email Summarizer', desc: 'Checks Gmail every hour', status: 'Active', iconName: 'Mail' }
  ],
  preferences: DEFAULT_PREFS
};

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
  }
};
