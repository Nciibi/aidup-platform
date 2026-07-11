// ─── Auth Store (Zustand) ───────────────────────────────────────────────────
// Replaces: AuthViewModel.kt state management
// Global auth state that persists across components

import { create } from 'zustand';
import { tokenManager } from '../utils/token';

interface AuthState {
  isLoggedIn: boolean;
  userId: string | null;
  userRole: string | null;
  userName: string | null;
  userEmail: string | null;
  isVerified: boolean;
  isDarkMode: boolean;
  // Actions
  hydrate: () => void;
  setAuth: (userId: string, role: string, name: string, email: string, isVerified?: boolean | null) => void;
  logout: () => void;
  toggleDarkMode: () => void;
  updateProfileInfo: (name: string, role: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  userId: null,
  userRole: null,
  userName: null,
  userEmail: null,
  isVerified: false,
  isDarkMode: false,

  /** Initialize from localStorage (call once on app mount) */
  hydrate: () => {
    set({
      isLoggedIn: tokenManager.isLoggedIn(),
      userId: tokenManager.getUserId(),
      userRole: tokenManager.getUserRole(),
      userName: tokenManager.getUserName(),
      userEmail: tokenManager.getUserEmail(),
      isVerified: tokenManager.isVerifiedOrganizer(),
      isDarkMode: tokenManager.getDarkMode(),
    });
  },

  setAuth: (userId, role, name, email, isVerified) => {
    set({
      isLoggedIn: true,
      userId,
      userRole: role,
      userName: name,
      userEmail: email,
      isVerified: isVerified ?? false,
    });
  },

  logout: () => {
    tokenManager.clearAll();
    set({
      isLoggedIn: false,
      userId: null,
      userRole: null,
      userName: null,
      userEmail: null,
      isVerified: false,
    });
  },

  toggleDarkMode: () => {
    set((state) => {
      const newVal = !state.isDarkMode;
      tokenManager.setDarkMode(newVal);
      document.documentElement.classList.toggle('dark', newVal);
      return { isDarkMode: newVal };
    });
  },

  updateProfileInfo: (name, role) => {
    tokenManager.saveProfileInfo(name, role);
    set({ userName: name, userRole: role });
  },
}));
