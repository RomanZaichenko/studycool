"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
};

interface AIChatProps {
  onClose: () => void;
}

export function AIChat({ onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I am your AI assistant. How can I help you today?",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target as Node)
      ) {
        const headerButton = document.getElementById("ai-chat-header-button");
        if (headerButton && headerButton.contains(event.target as Node)) {
          return;
        }
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "This is a mock response from the AI. Connect your API here to get real answers!",
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div
      ref={chatContainerRef}
      className="flex h-[600px] w-full max-w-md flex-col rounded-sm border border-gray-200 bg-white font-sans shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-hover opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary-color"></span>
          </div>
          <h3 className="text-xs font-bold tracking-wider text-gray-700 uppercase">
            AI Assistant
          </h3>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 transition-colors hover:text-gray-600"
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
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
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
                  : "border border-gray-200 bg-white text-primary-color shadow-sm"
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
            className="rotate-90 rounded-sm bg-primary-color p-3 text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
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
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
