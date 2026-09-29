"use client";

import React from "react";

export const CuratorAdvisoryCard: React.FC = () => {
  return (
    <div className="w-full pb-4">
      {/* Curator Advisory Header Card */}
      <div className="bg-surface-raised/80 backdrop-blur-md rounded-xl p-4 md:p-5 shadow-sm border border-border-antique/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[22px]">account_balance</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-headline text-lg md:text-xl text-primary font-semibold tracking-tight">
                Valuation Concierge Desk
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-card text-on-surface-variant font-label text-[10px] uppercase tracking-widest border border-border-antique/50">
                Ref: DAR-8429
              </span>
            </div>
            <p className="font-body text-xs md:text-sm text-on-surface-variant mt-0.5">
              Archival appraisal consultation • Vertex AI Runtime &amp; Geneva Auction Archive Sync
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-gilded-amber/10 text-gilded-amber border border-gilded-amber/20 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span className="font-label text-xs font-semibold tracking-wide">
              99.4% Confidence
            </span>
          </div>
        </div>
      </div>

      {/* Editorial Date Divider */}
      <div className="flex items-center justify-center my-5 gap-3">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-border-antique to-transparent" />
        <div className="px-4 py-1 rounded-full bg-surface-card text-outline font-label text-[11px] tracking-widest uppercase shadow-sm border border-border-antique/60">
          Today • Live Session • Geneva &amp; Sothebys Sync
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-border-antique to-transparent" />
      </div>
    </div>
  );
};
