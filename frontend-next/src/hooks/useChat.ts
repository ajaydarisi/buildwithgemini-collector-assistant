"use client";

import { useState, useCallback, useEffect } from "react";
import { Message, ChatPayload, ChatPart } from "../types/chat";

const INITIAL_MESSAGE: Message = {
  id: "initial-agent-msg",
  sender: "agent",
  text: "Welcome to **Collector Assistant**. I can help you search rare catalog pieces, inspect authenticity, calculate multi-year investment CAGRs, generate high-definition showcase art, or verify items using your camera.\n\nTap **Scan Item** below to photograph a collectible, or choose one of the suggested prompts to begin.",
  timestamp: new Date(),
  status: "done",
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>("collector-user");

  useEffect(() => {
    // Generate or retrieve persistent user ID
    if (typeof window !== "undefined") {
      let storedId = localStorage.getItem("collector_user_id");
      if (!storedId) {
        storedId = "user_" + Math.random().toString(36).substring(2, 9);
        localStorage.setItem("collector_user_id", storedId);
      }
      setUserId(storedId);
    }
  }, []);

  const sendMessage = useCallback(
    async (text?: string, imageData?: string | null) => {
      const trimmedText = text?.trim() || "";
      if (!trimmedText && !imageData) return;

      const userMsgId = "user_" + Date.now();
      const userMessage: Message = {
        id: userMsgId,
        sender: "user",
        text: trimmedText || (imageData ? "Inspect this item from my camera" : ""),
        imageData: imageData || undefined,
        timestamp: new Date(),
        status: "done",
      };

      const agentMsgId = "agent_" + (Date.now() + 1);
      const tempAgentMessage: Message = {
        id: agentMsgId,
        sender: "agent",
        timestamp: new Date(),
        status: "sending",
      };

      setMessages((prev) => [...prev, userMessage, tempAgentMessage]);
      setIsLoading(true);

      try {
        const payload: ChatPayload = {
          message: trimmedText || (imageData ? "Inspect this item from my camera" : ""),
          image_data: imageData || null,
          user_id: userId,
        };

        const res = await fetch("/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Server returned ${res.status}: ${errText}`);
        }

        const data = await res.json();
        const parts: ChatPart[] = Array.isArray(data.parts) ? data.parts : [];

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === agentMsgId) {
              return {
                ...msg,
                parts,
                status: "done",
              };
            }
            return msg;
          })
        );
      } catch (err: any) {
        console.error("Failed to send message:", err);
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === agentMsgId) {
              return {
                ...msg,
                status: "error",
                errorMessage: err.message || "Failed to reach agent engine.",
              };
            }
            return msg;
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  return {
    messages,
    isLoading,
    sendMessage,
  };
}
