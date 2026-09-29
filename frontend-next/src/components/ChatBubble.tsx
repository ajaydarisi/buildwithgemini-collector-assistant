"use client";

import React from "react";
import { Message } from "../types/chat";
import { MarkdownContent } from "./MarkdownContent";
import { A2UIRenderer } from "./A2UIRenderer";
import { Bot, User, CheckCircle2, AlertCircle, Clock } from "lucide-react";

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

          {message.status === "sending" && (
            <div className="thinking-indicator">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span className="thinking-text">Curating reply…</span>
            </div>
          )}

          {combinedText && <MarkdownContent content={combinedText} />}

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
          justify-content: flex-end;
        }
        .bubble-avatar {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }
        .agent-avatar {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1.5px solid #d97706;
          font-size: 1.25rem;
        }
        .user-avatar {
          background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
          color: #ffffff;
        }
        .bubble-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 82%;
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
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        .dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
        .error-callout {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin-top: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
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
