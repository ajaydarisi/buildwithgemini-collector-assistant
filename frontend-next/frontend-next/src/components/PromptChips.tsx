"use client";

import React from "react";

interface PromptChipsProps {
  onSelectPrompt: (prompt: string) => void;
  onOpenScanner?: () => void;
}

const CHIPS = [
  {
    icon: "photo_camera",
    label: "Scan with Camera",
    isScanner: true,
  },
  {
    icon: "sports_basketball",
    label: "1986 Fleer Jordan #57 PSA 10",
    prompt: "Provide an appraisal and market valuation for a 1986 Fleer Michael Jordan #57 Rookie Card PSA 10.",
  },
  {
    icon: "trending_up",
    label: "15-yr Compound Growth",
    prompt: "Calculate the 15-year compound annual growth rate (CAGR) for a collectible purchased at $4,500 and now worth $45,000.",
  },
  {
    icon: "palette",
    label: "Showcase Art (Charizard)",
    prompt: "Generate a dramatic, museum-quality showcase illustration of a 1999 1st Edition Shadowless Charizard Holo card.",
  },
  {
    icon: "history_edu",
    label: "Provenance Chain Verification",
    prompt: "How do you verify the provenance chain and historical sales ledger for high-value collectibles?",
  },
];

export const PromptChips: React.FC<PromptChipsProps> = ({
  onSelectPrompt,
  onOpenScanner,
}) => {
  return (
    <div className="w-full flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      {CHIPS.map((chip, idx) => (
        <button
          key={idx}
          onClick={() => {
            if (chip.isScanner && onOpenScanner) {
              onOpenScanner();
            } else if (chip.prompt) {
              onSelectPrompt(chip.prompt);
            }
          }}
          type="button"
          className="shrink-0 px-3.5 py-1.5 rounded-full bg-surface-card hover:bg-surface-raised text-on-surface-variant hover:text-primary text-xs font-label shadow-sm transition-colors border border-border-antique/70 flex items-center gap-1.5 active:scale-95"
        >
          <span className="material-symbols-outlined text-[15px] text-gilded-amber">
            {chip.icon}
          </span>
          <span>{chip.label}</span>
        </button>
      ))}
    </div>
  );
};
