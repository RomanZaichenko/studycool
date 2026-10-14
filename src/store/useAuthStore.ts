import { create } from "zustand";

interface AuthModalState {
  isSignInModalOpen: boolean;
  openSignInModal: () => void;
  closeSignInModal: () => void;
}

export const useAuthStore = create<AuthModalState>((set) => ({
  isSignInModalOpen: false,
  openSignInModal: () => set({ isSignInModalOpen: true }),
  closeSignInModal: () => set({ isSignInModalOpen: false }),
}));