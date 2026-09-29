"use client";

import React, { useEffect, useRef } from "react";
import { Message } from "../types/chat";
import { ChatBubble } from "./ChatBubble";

interface ChatLogProps {
  messages: Message[];
}

export const ChatLog: React.FC<ChatLogProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full flex flex-col gap-5">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
};
