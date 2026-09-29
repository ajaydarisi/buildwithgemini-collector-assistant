"use client";

import React from "react";

interface HeaderProps {
  onOpenScanner?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenScanner }) => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-canvas-linen/90 backdrop-blur-md shadow-[0_1px_8px_rgba(120,53,15,0.04)] border-b border-border-antique/40 pt-safe">
      <div className="h-16 md:h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container">
            <span className="material-symbols-outlined text-[20px]">verified</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gilded-amber shrink-0" />
              <h1 className="font-headline text-xl md:text-2xl text-primary font-medium tracking-tight leading-none">
                Curator Dialogue
              </h1>
            </div>
            <span className="font-label text-[10px] md:text-xs tracking-widest uppercase text-outline mt-0.5">
              Presented by Darisi
            </span>
          </div>
        </div>

        {/* Desktop Central AI Runtime Status Pill */}
        <div className="hidden lg:flex items-center">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface-raised shadow-[0_1px_4px_rgba(120,53,15,0.04)] border border-border-antique/60">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary" />
            </span>
            <span className="font-label text-xs text-on-surface-variant font-medium">
              Senior Horology &amp; Rare Collectibles Concierge • Connected to Vertex AI Runtime • Geneva Auction Archive Sync
            </span>
          </div>
        </div>

        {/* Actions Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-raised text-primary hover:bg-surface-card border border-border-antique text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] text-gilded-amber">
                document_scanner
              </span>
              <span className="hidden sm:inline">Scan Item</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-raised text-on-surface-variant border border-border-antique/50">
            <span className="material-symbols-outlined text-[15px] text-tertiary">lock</span>
            <span className="font-label text-xs tracking-wide font-medium">End-to-End Vault</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};
