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
    <div className="fixed bottom-0 inset-x-0 z-40 bg-gradient-to-t from-canvas-linen via-canvas-linen/95 to-transparent pb-4 md:pb-6 pt-3 pointer-events-none">
      <div className="max-w-3xl mx-auto px-4 pointer-events-auto flex flex-col gap-2">
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
            <span className="font-label text-xs font-medium">1 photo staged</span>
            <button
              type="button"
              onClick={onClearStagedImage}
              className="w-4 h-4 rounded-full bg-surface-raised flex items-center justify-center hover:bg-error-container hover:text-error transition-colors text-outline"
            >
              <span className="material-symbols-outlined text-[11px]">close</span>
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface-card/95 backdrop-blur-md rounded-2xl p-1.5 md:p-2 shadow-sm border border-border-antique flex items-center gap-2"
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
              title="Upload photo"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-outline hover:text-primary hover:bg-surface-raised transition-colors"
            >
              <span className="material-symbols-outlined text-[19px]">add_photo_alternate</span>
            </button>
            <button
              type="button"
              onClick={onOpenScanner}
              aria-label="Open Camera"
              title="Take a photo with camera"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-outline hover:text-primary hover:bg-surface-raised transition-colors"
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
              placeholder="Ask about collectibles, valuation, or upload a photo..."
              className="w-full bg-transparent border-0 outline-none text-on-surface font-body text-sm md:text-base placeholder:text-outline/60 px-2 py-1.5 focus:ring-0"
              disabled={isLoading}
            />
          </div>

          {/* Send Button */}
          <div className="pr-1">
            <button
              type="submit"
              disabled={(!inputText.trim() && !stagedImage) || isLoading}
              aria-label="Send"
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary text-on-primary hover:bg-primary-container transition-transform active:scale-95 shadow-sm flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
