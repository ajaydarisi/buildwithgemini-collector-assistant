"use client";

import React, { useState } from "react";

export const BottomNav: React.FC = () => {
  const [activeTab, setActiveTab] = useState("assistant");

  const tabs = [
    { id: "assistant", label: "Assistant", icon: "chat" },
    { id: "collection", label: "Collection", icon: "token" },
    { id: "appraisals", label: "Appraisals", icon: "history_edu" },
    { id: "curator", label: "Curator", icon: "account_circle" },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-canvas-linen/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(120,53,15,0.06)] border-t border-border-antique md:hidden">
      <div className="flex justify-around items-center h-14 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-colors ${
                isActive
                  ? "text-primary font-bold"
                  : "text-on-surface-variant hover:text-primary opacity-75"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {tab.icon}
              </span>
              <span className="font-label text-[9px] uppercase tracking-wider">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
