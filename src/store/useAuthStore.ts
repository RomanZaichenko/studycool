// src/store/useAuthStore.ts
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  user: { name: string; initials: string } | null;
  
  isSignInModalOpen: boolean;
  openSignInModal: () => void;
  closeSignInModal: () => void;
  
  login: (email: string) => void; // Приймаємо email для демо
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  
  isSignInModalOpen: false,
  openSignInModal: () => set({ isSignInModalOpen: true }),
  closeSignInModal: () => set({ isSignInModalOpen: false }),

  //Login sim
  login: (email: string) => {
    const initials = email.substring(0, 2).toUpperCase();
    set({ 
      isAuthenticated: true, 
      user: { name: email, initials: initials },
      isSignInModalOpen: false 
    });
  },
  
  logout: () => set({ isAuthenticated: false, user: null }),
}));