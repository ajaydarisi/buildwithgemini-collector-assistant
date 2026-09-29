"use client";

import React from "react";
import { Message } from "../types/chat";
import { MarkdownContent } from "./MarkdownContent";
import { A2UIRenderer } from "./A2UIRenderer";

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === "user";

  const a2uiParts = message.parts
    ? message.parts
        .filter((p) => p && p.kind === "a2ui" && Array.isArray((p as any).data))
        .map((p) => (p as any).data)
    : [];

  const textParts = message.parts
    ? message.parts
        .filter((p) => p && (p.kind === "text" || !(p as any).kind))
        .map((p) => (p as any).text || "")
    : [];

  const combinedText = message.text || textParts.join("\n").trim();
  const isStreaming = message.status === "sending";

  const timeFormatted = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1.5 max-w-2xl ml-auto self-end animate-fadeIn">
        <div className="bg-primary text-canvas-linen rounded-2xl rounded-tr-xs p-4 shadow-sm flex flex-col gap-2.5 w-full">
          {message.imageData && (
            <div className="rounded-xl overflow-hidden bg-primary-container max-w-sm">
              <img
                src={message.imageData}
                alt="Uploaded item"
                className="w-full max-h-56 object-cover"
              />
            </div>
          )}

          {combinedText && (
            <p className="font-body text-base leading-relaxed text-canvas-linen whitespace-pre-wrap">
              {combinedText}
            </p>
          )}
        </div>

        <span className="font-label text-[11px] text-outline pr-1">
          {timeFormatted}
        </span>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex flex-col items-start gap-1.5 max-w-3xl mr-auto w-full animate-fadeIn">
      {/* Sender Header */}
      <div className="flex items-center gap-1.5 ml-1 text-outline">
        <img src="/favicon.svg" alt="Icon" className="w-4 h-4 rounded-sm shrink-0" />
        <span className="font-label text-xs font-medium text-primary flex items-center gap-1">
          Collector Assistant
          <img src="/favicon.svg" alt="Icon" className="w-3.5 h-3.5 opacity-80 shrink-0" />
        </span>
      </div>

      {/* Bubble Container */}
      <div className="w-full bg-surface-card rounded-2xl p-4 md:p-5 shadow-sm border border-border-antique flex flex-col gap-3">
        {/* Live In-Progress Status */}
        {isStreaming && (
          <div className="flex items-center gap-2 text-xs font-label text-gilded-amber bg-surface-raised px-3 py-2 rounded-lg border border-border-antique/50">
            <span className="material-symbols-outlined text-[15px] animate-spin">
              progress_activity
            </span>
            <span>{message.statusText || "Consulting records and analyzing..."}</span>
          </div>
        )}

        {/* Response Body */}
        {combinedText && (
          <div className="relative">
            <MarkdownContent content={combinedText} />
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-1 align-middle" />
            )}
          </div>
        )}

        {/* A2UI Cards */}
        {a2uiParts.map((a2uiMsgArray, idx) => (
          <div key={idx} className="mt-2">
            <A2UIRenderer messages={a2uiMsgArray} />
          </div>
        ))}
      </div>

      <span className="font-label text-[11px] text-outline pl-1">
        {timeFormatted}
      </span>
    </div>
  );
};
