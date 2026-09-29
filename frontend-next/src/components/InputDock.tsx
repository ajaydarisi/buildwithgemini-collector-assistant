"use client";

import React, { useState, useRef } from "react";
import { PromptChips } from "./PromptChips";

interface InputDockProps {
  onSendMessage: (text: string, imageData?: string | null) => void;
  isLoading: boolean;
  stagedImage: string | null;
  onClearStagedImage: () => void;
  onOpenScanner: () => void;
  onSelectPrompt: (prompt: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputDock: React.FC<InputDockProps> = ({
  onSendMessage,
  isLoading,
  stagedImage,
  onClearStagedImage,
  onOpenScanner,
  onSelectPrompt,
  onFileSelect,
}) => {
  const [inputText, setInputText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !stagedImage) || isLoading) return;

    onSendMessage(inputText, stagedImage);
    setInputText("");
    onClearStagedImage();
  };

  return (
    <div className="fixed bottom-14 md:bottom-0 inset-x-0 z-40 bg-gradient-to-t from-canvas-linen via-canvas-linen/95 to-transparent pb-3 md:pb-6 pt-3 pointer-events-none">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 pointer-events-auto flex flex-col gap-2">
        {/* Recommended Inquiries */}
        <PromptChips
          onSelectPrompt={onSelectPrompt}
          onOpenScanner={onOpenScanner}
        />

        {/* Staged Attachment Pill */}
        {stagedImage && (
          <div className="flex items-center gap-2 bg-surface-card text-on-surface px-3 py-1 rounded-full shadow-sm self-start border border-border-antique/70">
            <span className="material-symbols-outlined text-[15px] text-gilded-amber">
              attachment
            </span>
            <span className="font-label text-xs font-medium truncate max-w-[200px]">
              1 specimen_macro.jpg staged
            </span>
            <button
              type="button"
              onClick={onClearStagedImage}
              className="w-4 h-4 rounded-full bg-surface-raised flex items-center justify-center hover:bg-error-container hover:text-error transition-colors text-outline"
            >
              <span className="material-symbols-outlined text-[11px]">close</span>
            </button>
          </div>
        )}

        {/* Main Input Deck */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface-card/95 backdrop-blur-md rounded-2xl p-1.5 md:p-2 shadow-lg border border-border-antique flex items-center gap-2"
        >
          {/* Hidden File Picker */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileSelect}
          />

          {/* Left Actions */}
          <div className="flex items-center gap-0.5 pl-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload Photo"
              className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-outline hover:text-primary hover:bg-surface-raised transition-colors"
            >
              <span className="material-symbols-outlined text-[19px]">add</span>
            </button>
            <button
              type="button"
              onClick={onOpenScanner}
              aria-label="Open Camera Scanner"
              className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-outline hover:text-primary hover:bg-surface-raised transition-colors"
            >
              <span className="material-symbols-outlined text-[19px]">photo_camera</span>
            </button>
          </div>

          {/* Text Input */}
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Inquire about provenance, lot records, or upload high-res macro photos..."
              className="w-full bg-transparent border-0 outline-none text-on-surface font-body text-xs sm:text-sm md:text-base placeholder:text-outline/70 px-2 py-1.5 focus:ring-0"
              disabled={isLoading}
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 pr-1">
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded bg-surface-raised text-on-surface-variant font-label text-[11px] border border-border-antique/50">
              <span className="material-symbols-outlined text-[13px] text-tertiary">memory</span>
              <span>Vertex AI 1.5</span>
            </div>

            <button
              type="submit"
              disabled={(!inputText.trim() && !stagedImage) || isLoading}
              aria-label="Send Inquiry"
              className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-primary text-on-primary hover:bg-primary-container transition-transform active:scale-95 shadow-md flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <span className="material-symbols-outlined text-[18px] md:text-[20px]">arrow_upward</span>
            </button>
          </div>
        </form>

        {/* Trust & Encryption Micro-footer */}
        <div className="flex items-center justify-center gap-2 text-outline font-label text-[10px] md:text-xs text-center pt-0.5">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] text-tertiary">lock</span>
            End-to-End Encrypted Concierge Vault
          </span>
          <span>•</span>
          <span>Darisi Ver. 3.4.1</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Strict Horology &amp; Auction Ledger Grade</span>
        </div>
      </div>
    </div>
  );
};
