"use client";

import { useState } from "react";
import { AIChat } from "./AIChat";

export function AIChatHeaderButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        id="ai-chat-header-button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center rounded-sm p-2 transition-colors ${
          isOpen
            ? "bg-gray-200 text-gray-800"
            : "text-white hover:bg-gray-200 hover:text-gray-800"
        }`}
        aria-label="Toggle AI Assistant"
      >

        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed top-20 right-6 z-[3000] rounded-sm shadow-2xl">
          <AIChat onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
