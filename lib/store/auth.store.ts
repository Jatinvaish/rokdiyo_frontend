import { create } from 'zustand';
import { User } from '@/lib/services/auth.service';

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  getUser: () => User | null;
  isSuperAdmin: () => boolean;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: typeof window !== 'undefined' 
    ? (() => {
        try {
          const userStr = localStorage.getItem('user');
          return userStr ? JSON.parse(userStr) : null;
        } catch {
          return null;
        }
      })()
    : null,

  setUser: (user: User | null) => {
    set({ user });
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    }
  },

  getUser: () => get().user,

  isSuperAdmin: () => get().user?.userType === 'SUPER_ADMIN',

  clearUser: () => {
    set({ user: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },
}));
