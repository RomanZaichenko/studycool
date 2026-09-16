"use client";

import { X, Send } from "lucide-react";
import { useAIChat } from "@/app/hooks/useAIChat";

interface AIChatProps {
  onClose: () => void;
}

export function AIChat({ onClose }: AIChatProps) {
  const {
    messages,
    input,
    setInput,
    isTyping,
    messagesEndRef,
    chatContainerRef,
    handleSend,
  } = useAIChat({ onClose });

  return (
    <div
      ref={chatContainerRef}
      className="flex h-[600px] w-full max-w-md flex-col rounded-sm border border-gray-200 bg-white font-sans shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="bg-primary-hover absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
            <span className="bg-primary-color relative inline-flex h-3 w-3 rounded-full"></span>
          </div>
          <h3 className="text-xs font-bold tracking-wider text-gray-700 uppercase">
            AI Assistant
          </h3>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 transition-colors hover:text-gray-600"
        >
          <X strokeWidth={2} className="h-5 w-5" />
        </button>
      </div>

      <div className="scrollbar-thin scrollbar-thumb-gray-200 flex flex-1 flex-col gap-4 overflow-y-auto bg-[#F9F9F9] p-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-sm px-4 py-3 text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-primary-color text-white shadow-sm"
                  : "text-primary-color border border-gray-200 bg-white shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex w-full justify-start">
            <div className="flex items-center gap-1.5 rounded-sm border border-gray-200 bg-white px-4 py-4 shadow-sm">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-100 bg-white p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message..."
            className="flex-1 rounded-sm border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-colors outline-none placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-primary-color hover:bg-primary-hover rotate-90 rounded-sm p-3 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <Send strokeWidth={2} className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
