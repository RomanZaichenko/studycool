import { useState, useEffect } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAuthStore } from "@/store/useAuthStore";

export const LANGUAGES = [
  { id: "en", name: "English", code: "US" },
  { id: "ua", name: "Українська", code: "UA" },
] as const;

export function useSettingsModal() {
  const {
    isSettingsOpen,
    closeSettings,
    theme,
    setTheme,
    language,
    setLanguage,
    mapTheme,
    setMapTheme,
    useThickLines,
    setUseThickLines,
  } = useSettingsStore();

  const { logout, user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"general" | "map" | "account">(
    "general"
  );
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLangObj =
    LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];

  const selectLanguage = (id: "en" | "ua") => {
    setLanguage(id);
    setIsLangDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeSettings();
  };

  return {
    mounted,
    isSettingsOpen,
    closeSettings,
    theme,
    setTheme,
    mapTheme,
    setMapTheme,
    useThickLines,
    setUseThickLines,
    user,
    activeTab,
    setActiveTab,
    isLangDropdownOpen,
    setIsLangDropdownOpen,
    languages: LANGUAGES,
    currentLangObj,
    language,
    selectLanguage,
    handleLogout,
  };
}