"use client";

import React, { useRef, useEffect } from "react";
import { Message } from "../types/chat";
import { ChatBubble } from "./ChatBubble";

interface ChatLogProps {
  messages: Message[];
}

export const ChatLog: React.FC<ChatLogProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-log-scroll">
      <div className="chat-log-inner">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} className="scroll-anchor" />
      </div>

      <style jsx>{`
        .chat-log-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
        }
        .chat-log-inner {
          max-width: 960px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .scroll-anchor {
          height: 1px;
          visibility: hidden;
        }
        @media (max-width: 640px) {
          .chat-log-scroll {
            padding: 1rem 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};
