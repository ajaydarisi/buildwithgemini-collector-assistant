"use client";

import React from "react";
import { Camera, Sparkles, TrendingUp, Layers, Compass } from "lucide-react";

interface PromptChipsProps {
  onSelectPrompt: (text: string) => void;
  onOpenScanner: () => void;
  disabled?: boolean;
}

export const PromptChips: React.FC<PromptChipsProps> = ({
  onSelectPrompt,
  onOpenScanner,
  disabled = false,
}) => {
  const chips = [
    {
      label: "Scan with Camera",
      icon: Camera,
      action: onOpenScanner,
      highlight: true,
    },
    {
      label: "Rare Trading Cards",
      icon: Layers,
      prompt: "Show rare trading cards in the catalog",
    },
    {
      label: "Showcase Art (Jordan)",
      icon: Sparkles,
      prompt: "Generate a showcase image for a 1986 Fleer Michael Jordan rookie card",
    },
    {
      label: "15-yr CAGR Calculation",
      icon: TrendingUp,
      prompt: "Calculate CAGR if bought at $5,000 and sold at $18,500 over 15 years",
    },
    {
      label: "Nearby Hobby Shops",
      icon: Compass,
      prompt: "Find nearby collectible hobby shops and auction houses",
    },
  ];

  return (
    <div className="prompt-chips-wrapper">
      <div className="prompt-label">
        <Sparkles size={13} className="sparkle-icon" />
        <span>Suggestions</span>
      </div>
      <div className="chips-scroll">
        {chips.map((chip, idx) => {
          const Icon = chip.icon;
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              className={`chip-btn ${chip.highlight ? "highlight" : ""}`}
              onClick={() => {
                if (chip.action) {
                  chip.action();
                } else if (chip.prompt) {
                  onSelectPrompt(chip.prompt);
                }
              }}
            >
              <Icon size={14} className="chip-icon" />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .prompt-chips-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 1.25rem 0.25rem;
          max-width: 960px;
          margin: 0 auto;
          width: 100%;
        }
        .prompt-label {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #92400e;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .sparkle-icon {
          color: #d97706;
        }
        .chips-scroll {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-bottom: 2px;
        }
        .chips-scroll::-webkit-scrollbar {
          display: none;
        }
        .chip-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.38rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.82rem;
          font-weight: 600;
          border: 1px solid #e7dfcf;
          background: #ffffff;
          color: #451a03;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          flex-shrink: 0;
        }
        .chip-btn:hover:not(:disabled) {
          background: #fdfaf3;
          border-color: #d97706;
          color: #b45309;
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(180, 83, 9, 0.12);
        }
        .chip-btn.highlight {
          background: #fffbeb;
          border-color: #fde68a;
          color: #92400e;
          font-weight: 700;
        }
        .chip-btn.highlight:hover:not(:disabled) {
          background: #fef3c7;
          border-color: #d97706;
        }
        .chip-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .chip-icon {
          color: #d97706;
        }
        @media (max-width: 640px) {
          .prompt-chips-wrapper {
            padding: 0.4rem 1rem 0.2rem;
          }
          .prompt-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
