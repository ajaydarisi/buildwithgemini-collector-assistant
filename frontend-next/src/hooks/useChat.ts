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
        text: "",
        parts: [],
        timestamp: new Date(),
        status: "sending",
        statusText: "Consulting curator...",
      };

      setMessages((prev) => [...prev, userMessage, tempAgentMessage]);
      setIsLoading(true);

      try {
        const payload: ChatPayload = {
          message: trimmedText || (imageData ? "Inspect this item from my camera" : ""),
          image_data: imageData || null,
          user_id: userId,
        };

        const res = await fetch("/chat/stream", {
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

        if (!res.body) {
          throw new Error("No readable stream body returned by server.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;

            const jsonStr = trimmed.replace(/^data:\s*/, "");
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr);

              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id !== agentMsgId) return msg;

                  if (event.kind === "status") {
                    return {
                      ...msg,
                      statusText: event.text || msg.statusText,
                    };
                  } else if (event.kind === "delta") {
                    const nextText = (msg.text || "") + (event.delta || "");
                    return {
                      ...msg,
                      text: nextText,
                      statusText: undefined,
                    };
                  } else if (event.kind === "a2ui") {
                    const currentParts = msg.parts ? [...msg.parts] : [];
                    currentParts.push({ kind: "a2ui", data: event.data });
                    return {
                      ...msg,
                      parts: currentParts,
                      statusText: undefined,
                    };
                  } else if (event.kind === "error") {
                    return {
                      ...msg,
                      status: "error",
                      errorMessage: event.error || "An error occurred during streaming.",
                      statusText: undefined,
                    };
                  } else if (event.kind === "done") {
                    return {
                      ...msg,
                      status: "done",
                      statusText: undefined,
                    };
                  }
                  return msg;
                })
              );
            } catch (jsonErr) {
              console.warn("Failed to parse SSE JSON chunk:", jsonStr, jsonErr);
            }
          }
        }

        // Finalize done state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === agentMsgId ? { ...msg, status: "done", statusText: undefined } : msg
          )
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
                statusText: undefined,
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
