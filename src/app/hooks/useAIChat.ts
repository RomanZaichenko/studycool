import { useState, useRef, useEffect } from "react";
import { useMapEditorStore } from "@/store/useMapEditorStore";
import { MapEditorState } from "@/store/useMapEditorStore";

export type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
};

interface UseAIChatArgs {
  onClose: () => void;
}

export function useAIChat({ onClose }: UseAIChatArgs) {
  const currentMapId = useMapEditorStore(
    (state: MapEditorState) => state.currentMapId
  );
  const currentNodes = useMapEditorStore(
    (state: MapEditorState) => state.nodes
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: currentMapId
        ? `Hello! I am your AI assistant. What would you like to know about this material?`
        : "Hello! I am your AI assistant. How can I help you today?",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const getMapContext = () => {
    if (!currentMapId || currentNodes.length === 0) return null;

    const contextStrings = currentNodes
      .map((node) => {
        const title = node.data?.label || "Untitled";
        const rawContent = (node.data?.noteContent as string) || "";
        const cleanContent = rawContent
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        if (!cleanContent) return "";
        return `Section: ${title}\nContent: ${cleanContent}`;
      })
      .filter(Boolean);

    return contextStrings.join("\n\n---\n\n");
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: userText, sender: "user" },
    ]);

    setInput("");
    setIsTyping(true);

    try {
      const mapContext = getMapContext();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, mapContext }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to get response from AI");

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: data.reply, sender: "ai" },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "An error occurred while communicating with the AI. Please try again.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isTyping,
    messagesEndRef,
    chatContainerRef,
    handleSend,
  };
}
