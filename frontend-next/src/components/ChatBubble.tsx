"use client";

import React from "react";
import { Message } from "../types/chat";
import { MarkdownContent } from "./MarkdownContent";
import { A2UIRenderer } from "./A2UIRenderer";
import { User, AlertCircle } from "lucide-react";

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

  return (
    <div className={`chat-bubble-row ${isUser ? "user" : "agent"}`}>
      {!isUser && (
        <div className="bubble-avatar agent-avatar">
          <span>🏺</span>
        </div>
      )}

      <div className="bubble-wrapper">
        <div className="bubble-header">
          <span className="sender-tag">
            {isUser ? "You" : "Collector Assistant"}
          </span>
          <span className="timestamp">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className={`bubble-card ${isUser ? "bubble-user" : "bubble-agent"}`}>
          {message.imageData && (
            <div className="attached-photo-card">
              <img
                src={message.imageData}
                alt="Uploaded or captured item"
                className="attached-photo-img"
              />
              <span className="photo-tag">📷 Photographed Item</span>
            </div>
          )}

          {isStreaming && !combinedText && (
            <div className="thinking-indicator">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span className="thinking-text">
                {message.statusText || "Curating reply…"}
              </span>
            </div>
          )}

          {combinedText && (
            <div className="streaming-text-container">
              <MarkdownContent content={combinedText} />
              {isStreaming && <span className="typing-cursor" />}
            </div>
          )}

          {a2uiParts.map((a2uiMsgArray, idx) => (
            <A2UIRenderer key={idx} messages={a2uiMsgArray} />
          ))}

          {message.status === "error" && (
            <div className="error-callout">
              <AlertCircle size={16} />
              <span>{message.errorMessage || "Failed to deliver message."}</span>
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="bubble-avatar user-avatar">
          <User size={18} />
        </div>
      )}

      <style jsx>{`
        .chat-bubble-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          max-width: 100%;
          animation: fadeIn 0.25s ease-out;
        }
        .chat-bubble-row.user {
          flex-direction: row-reverse;
        }
        .bubble-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          font-size: 1.1rem;
        }
        .agent-avatar {
          background: #fef3c7;
          border: 1px solid #fde68a;
          color: #92400e;
        }
        .user-avatar {
          background: #78350f;
          border: 1px solid #b45309;
          color: #ffffff;
        }
        .bubble-wrapper {
          max-width: 82%;
          display: flex;
          flex-direction: column;
        }
        .chat-bubble-row.user .bubble-wrapper {
          align-items: flex-end;
        }
        .bubble-header {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin-bottom: 0.25rem;
          padding: 0 0.35rem;
        }
        .sender-tag {
          font-size: 0.78rem;
          font-weight: 700;
          color: #78350f;
        }
        .timestamp {
          font-size: 0.7rem;
          color: #a8a29e;
        }
        .bubble-card {
          padding: 1rem 1.25rem;
          border-radius: 18px;
          position: relative;
          box-shadow: 0 4px 16px -2px rgba(69, 26, 3, 0.05);
          word-break: break-word;
        }
        .bubble-user {
          background: linear-gradient(135deg, #92400e 0%, #b45309 100%);
          color: #ffffff;
          border-top-right-radius: 4px;
        }
        .bubble-agent {
          background: #ffffff;
          border: 1px solid #e7dfcf;
          color: #292524;
          border-top-left-radius: 4px;
        }
        .attached-photo-card {
          margin-bottom: 0.75rem;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
        }
        .attached-photo-img {
          display: block;
          max-width: 100%;
          max-height: 260px;
          object-fit: contain;
          margin: 0 auto;
        }
        .photo-tag {
          display: block;
          padding: 0.3rem 0.6rem;
          background: rgba(0, 0, 0, 0.85);
          color: #fde68a;
          font-size: 0.72rem;
          font-weight: 600;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .thinking-indicator {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.2rem;
        }
        .thinking-text {
          font-size: 0.85rem;
          color: #92400e;
          font-weight: 600;
          margin-left: 0.3rem;
        }
        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #d97706;
          animation: pulseDot 1.4s infinite ease-in-out both;
        }
        .dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        .dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        .streaming-text-container {
          position: relative;
          display: inline;
        }
        .typing-cursor {
          display: inline-block;
          width: 8px;
          height: 15px;
          background-color: #d97706;
          margin-left: 4px;
          vertical-align: middle;
          border-radius: 2px;
          animation: blink 0.8s infinite;
        }
        .error-callout {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #fef2f2;
          color: #dc2626;
          padding: 0.6rem 0.8rem;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-top: 0.5rem;
          border: 1px solid #fee2e2;
        }
        @keyframes pulseDot {
          0%,
          80%,
          100% {
            transform: scale(0);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 640px) {
          .bubble-wrapper {
            max-width: 90%;
          }
          .bubble-card {
            padding: 0.85rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};
