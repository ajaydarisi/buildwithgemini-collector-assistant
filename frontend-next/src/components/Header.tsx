"use client";

import React from "react";

interface HeaderProps {
  onOpenScanner?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenScanner }) => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-canvas-linen/90 backdrop-blur-md border-b border-border-antique/50 pt-safe">
      <div className="h-14 md:h-16 max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-gilded-amber shrink-0" />
          <h1 className="font-headline text-xl text-primary font-semibold tracking-tight">
            Collector Assistant
          </h1>
          <span className="text-xs text-on-surface-variant font-label hidden sm:inline">
            • AI Valuation &amp; Appraisal
          </span>
        </div>

        {/* Right Status / Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-raised border border-border-antique/60 text-xs font-label text-on-surface-variant">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary" />
            </span>
            <span>Online</span>
          </div>

          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-card text-primary border border-border-antique text-xs font-label uppercase tracking-wider transition-colors shadow-sm"
              title="Scan collectible with camera"
            >
              <span className="material-symbols-outlined text-[16px] text-gilded-amber">
                photo_camera
              </span>
              <span className="hidden sm:inline">Scan Item</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
