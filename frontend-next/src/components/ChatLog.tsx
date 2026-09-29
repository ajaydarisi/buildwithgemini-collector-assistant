"use client";

import React, { useEffect, useRef } from "react";
import { Message } from "../types/chat";
import { ChatBubble } from "./ChatBubble";
import { CuratorAdvisoryCard } from "./CuratorAdvisoryCard";

interface ChatLogProps {
  messages: Message[];
}

export const ChatLog: React.FC<ChatLogProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full flex flex-col gap-6">
      <CuratorAdvisoryCard />

      <div className="flex flex-col gap-6">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};
