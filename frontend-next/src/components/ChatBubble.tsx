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

  // Generate stable docket ID based on message timestamp
  const docketNum = message.timestamp
    ? "DAR-" + (new Date(message.timestamp).getTime() % 10000).toString().padStart(4, "0") + "-PX"
    : "DAR-8429-PX";

  const timeFormatted = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1.5 max-w-2xl ml-auto self-end animate-fadeIn">
        <div className="flex items-center gap-2 mr-1">
          <span className="font-label text-xs text-on-surface-variant font-medium">
            Julian Vance • Verified Private Collector
          </span>
          <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label text-[10px] shadow-sm">
            JV
          </div>
        </div>

        {/* User Bubble Card */}
        <div className="bg-primary text-on-primary rounded-2xl rounded-tr-xs p-4 md:p-5 shadow-md flex flex-col gap-3 w-full">
          {message.imageData && (
            <div className="bg-surface-card rounded-xl p-2.5 shadow-sm flex items-center gap-3 text-on-surface">
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-surface-raised shadow-inner">
                <img
                  src={message.imageData}
                  alt="Captured Collectible"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-label text-xs font-semibold text-primary truncate">
                  specimen_macro_scan.raw
                </span>
                <span className="font-label text-[11px] text-outline">
                  High-Resolution Specimen Attachment
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-surface-raised text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[15px]">lock</span>
              </div>
            </div>
          )}

          {combinedText && (
            <p className="font-body text-base leading-relaxed text-canvas-linen">
              {combinedText}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-outline font-label text-[11px] pr-1">
          <span>{timeFormatted}</span>
          <span>•</span>
          <span className="text-tertiary flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[14px]">done_all</span> Delivered
          </span>
        </div>
      </div>
    );
  }

  // Agent (Curator AI) Message
  return (
    <div className="flex flex-col items-start gap-2 max-w-4xl mr-auto w-full animate-fadeIn">
      {/* Curator Header Badge */}
      <div className="flex items-center gap-2 ml-1">
        <div className="w-6 h-6 rounded-full bg-surface-raised text-primary flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
        </div>
        <span className="font-label text-xs text-primary font-semibold tracking-wide uppercase">
          Darisi Archival Appraisal Engine
        </span>
        <span className="px-1.5 py-0.5 rounded bg-surface-raised text-tertiary font-label text-[10px] border border-border-antique/50">
          Senior Horology Desk
        </span>
      </div>

      {/* Dossier Card Container */}
      <div className="w-full bg-surface-card rounded-2xl p-4 md:p-6 shadow-md border border-border-antique flex flex-col gap-4">
        {/* Dossier Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2 border-b border-border-antique/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gilded-amber" />
            <span className="font-label text-xs uppercase tracking-widest text-outline font-semibold">
              Appraisal Docket #{docketNum}
            </span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-gilded-amber/15 text-primary self-start sm:self-auto shadow-sm border border-gilded-amber/20">
            <span className="material-symbols-outlined text-[14px] text-gilded-amber">shield</span>
            <span className="font-label text-[11px] font-bold uppercase tracking-wider">
              Tier 1 • Vault Grade Verified
            </span>
          </div>
        </div>

        {/* Live In-Progress Streaming State */}
        {isStreaming && (
          <div className="bg-canvas-cream rounded-xl p-3.5 shadow-sm border border-border-antique/70 flex flex-col gap-2">
            <div className="flex items-center justify-between font-label text-xs">
              <span className="font-semibold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-gilded-amber animate-spin">
                  progress_activity
                </span>
                {message.statusText || "Compiling Geneva & Sotheby's auction records..."}
              </span>
              <span className="text-outline">Syncing Archives</span>
            </div>
            {/* Animated Progress Bar */}
            <div className="w-full bg-surface-card h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary-container h-full rounded-full transition-all duration-700 w-3/4 animate-pulse" />
            </div>
          </div>
        )}

        {/* Main Content Body */}
        {combinedText && (
          <div className="relative">
            <MarkdownContent content={combinedText} />
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-middle" />
            )}
          </div>
        )}

        {/* Render A2UI Components if present */}
        {a2uiParts.map((a2uiMsgArray, idx) => (
          <div key={idx} className="mt-2">
            <A2UIRenderer messages={a2uiMsgArray} />
          </div>
        ))}

        {/* Action Callouts Inside Docket */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-antique/50">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="bg-primary-container text-on-primary px-3.5 py-2 rounded text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 shadow-sm hover:bg-primary transition-colors"
            >
              <span>View Historical Records</span>
              <span className="material-symbols-outlined text-[15px]">north_east</span>
            </button>
            <button
              type="button"
              className="bg-canvas-linen text-primary px-3.5 py-2 rounded text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 shadow-sm border border-border-antique hover:bg-surface-raised transition-colors"
            >
              <span className="material-symbols-outlined text-[15px] text-tertiary">verified_user</span>
              <span>Request Escrow Inspection</span>
            </button>
          </div>
          <span className="font-label text-[11px] text-outline">
            Official Darisi Appraisal ID: #{docketNum}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-outline font-label text-[11px] pl-1">
        <span>{timeFormatted} • Geneva AI Node • Verified Database Sync</span>
      </div>
    </div>
  );
};
