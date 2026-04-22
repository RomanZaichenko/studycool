import { create } from "zustand";

interface SettingsState {
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  
  language: "en" | "ua";
  setLanguage: (lang: "en" | "ua") => void;

  //Placeholder themes
  mapTheme: "default" | "colorful" | "pastel" | "minimal";
  setMapTheme: (theme: "default" | "colorful" | "pastel" | "minimal") => void;

  useThickLines: boolean;
  setUseThickLines: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isSettingsOpen: false,
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),

  theme: "light",
  setTheme: (theme) => set({ theme }),

  language: "en", 
  setLanguage: (language) => set({ language }),

  mapTheme: "default",
  setMapTheme: (mapTheme) => set({ mapTheme }),

  useThickLines: false, 
  setUseThickLines: (useThickLines) => set({ useThickLines }),
}));