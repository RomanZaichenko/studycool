"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAuthStore } from "@/store/useAuthStore";

export function SettingsModal() {
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

  if (!mounted || !isSettingsOpen) return null;

  const languages = [
    { id: "en", name: "English", code: "US" },
    { id: "ua", name: "Українська", code: "UA" },
  ];

  const currentLangObj =
    languages.find((l) => l.id === language) || languages[0];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#111111]/80 p-4 font-sans backdrop-blur-sm"
      onClick={closeSettings}
    >
      <div
        className="relative flex h-[600px] w-full max-w-4xl overflow-hidden rounded-lg bg-[#f0f0f0] shadow-2xl"
        onClick={(e) => {
          e.stopPropagation();
          if (isLangDropdownOpen) setIsLangDropdownOpen(false);
        }}
      >
        {/* Кнопка закриття */}
        <button
          onClick={closeSettings}
          className="absolute top-4 right-4 z-10 text-gray-400 transition-colors hover:text-gray-600"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Сайдбар */}
        <div className="flex w-64 flex-col gap-2 border-r border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Settings</h2>
          <button
            onClick={() => setActiveTab("general")}
            className={`rounded-md px-4 py-2 text-left text-sm font-bold transition-colors ${activeTab === "general" ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:bg-gray-100"}`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`rounded-md px-4 py-2 text-left text-sm font-bold transition-colors ${activeTab === "map" ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Map Style
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`rounded-md px-4 py-2 text-left text-sm font-bold transition-colors ${activeTab === "account" ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Account
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-10">
          {activeTab === "general" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-10">
              <h3 className="border-b pb-2 text-2xl font-bold text-gray-800">
                General Settings
              </h3>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-700">
                  App Theme
                </label>
                <div className="flex gap-3">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`rounded border px-6 py-2.5 text-sm font-bold capitalize transition-all ${theme === t ? "border-primary-hover text-primary-color bg-blue-50" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-700">
                  Language / Мова
                </label>

                <div className="relative w-full max-w-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLangDropdownOpen(!isLangDropdownOpen);
                    }}
                    className="focus:border-primary-hover flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-gray-500 uppercase">
                        {currentLangObj.code}
                      </span>
                      <span>{currentLangObj.name}</span>
                    </div>
                    <svg
                      className={`h-5 w-5 text-gray-400 transition-transform ${isLangDropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isLangDropdownOpen && (
                    <div className="animate-in fade-in slide-in-from-top-2 absolute top-full left-0 z-20 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                      {languages.map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => {
                            setLanguage(lang.id as "en" | "ua");
                            setIsLangDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold transition-colors hover:bg-gray-50 ${
                            language === lang.id
                              ? "text-primary-color bg-blue-50"
                              : "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 uppercase">{lang.code}</span>
                            <span>{lang.name}</span>
                          </div>
                          {language === lang.id && (
                            <svg
                              className="text-primary-color h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "map" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-8">
              <h3 className="border-b pb-2 text-2xl font-bold text-gray-800">
                Map Nodes Style
              </h3>
              <div className="grid max-w-md grid-cols-2 gap-3">
                {(["default", "colorful", "pastel", "minimal"] as const).map(
                  (style) => (
                    <button
                      key={style}
                      onClick={() => setMapTheme(style)}
                      className={`rounded-lg border px-4 py-3 text-left text-sm font-bold transition-all ${mapTheme === style ? "border-primary-hover text-primary-color bg-blue-50 shadow-sm" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  )
                )}
              </div>
              <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
                <input
                  type="checkbox"
                  id="thick-lines"
                  checked={useThickLines}
                  onChange={(e) => setUseThickLines(e.target.checked)}
                  className="text-primary-color focus:ring-primary-hover h-4 w-4 rounded border-gray-300"
                />
                <label
                  htmlFor="thick-lines"
                  className="cursor-pointer text-sm font-bold text-gray-700"
                >
                  Use thick connecting lines
                </label>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-8">
              <h3 className="border-b pb-2 text-2xl font-bold text-gray-800">
                Account
              </h3>
              {user ? (
                <div className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-5 shadow-sm">
                  <div className="bg-primary-color flex h-14 w-14 items-center justify-center rounded-md text-xl font-bold text-white shadow-sm">
                    {user.initials}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">
                      {user.name}
                    </p>
                    <p className="text-sm font-medium text-gray-500">
                      Logged in
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-bold text-gray-500 italic">
                  Not logged in.
                </p>
              )}
              <div className="mt-auto border-t border-red-100 pt-6">
                <button
                  onClick={() => {
                    logout();
                    closeSettings();
                  }}
                  className="rounded-md border border-red-200 bg-red-50 px-6 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
