"use client";

import React from "react";
import { ShinyText } from "./reactbits/ShinyText";
import { Sparkles, Camera } from "lucide-react";

interface HeaderProps {
  onOpenScanner?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenScanner }) => {
  return (
    <header className="header-root">
      <div className="header-container">
        <div className="brand-group">
          <div className="avatar-brand">
            <span className="avatar-icon">🏺</span>
          </div>
          <div className="brand-titles">
            <div className="title-row">
              <h1 className="brand-name">
                <ShinyText text="Collector Assistant" speed={4} />
              </h1>
              <span className="badge-expert">AI Curator</span>
            </div>
            <p className="brand-subtitle">
              Rare Collectibles, Authentication & Valuation
            </p>
          </div>
        </div>

        <div className="header-actions">
          {onOpenScanner && (
            <button
              type="button"
              className="btn-header-scan"
              onClick={onOpenScanner}
              title="Open camera scanner"
            >
              <Camera size={16} />
              <span className="btn-text">Scan Item</span>
            </button>
          )}

          <div className="status-indicator" title="Connected to Vertex AI Agent Runtime">
            <span className="status-pulse" />
            <span className="status-label">Online</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .header-root {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(253, 251, 247, 0.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(231, 223, 207, 0.8);
          box-shadow: 0 4px 20px -2px rgba(69, 26, 3, 0.04);
        }
        .header-container {
          max-width: 960px;
          margin: 0 auto;
          padding: 0.85rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .brand-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .avatar-brand {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1.5px solid #d97706;
          box-shadow: 0 4px 10px rgba(180, 83, 9, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.45rem;
          flex-shrink: 0;
        }
        .brand-titles {
          display: flex;
          flex-direction: column;
        }
        .title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .brand-name {
          font-family: var(--font-heading, "Cinzel", Georgia, serif);
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          margin: 0;
          line-height: 1.2;
        }
        .badge-expert {
          font-size: 0.68rem;
          font-weight: 700;
          color: #92400e;
          background: #fef3c7;
          border: 1px solid #fde68a;
          padding: 0.15rem 0.45rem;
          border-radius: 9999px;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        .brand-subtitle {
          font-size: 0.78rem;
          color: #78716c;
          margin: 0.15rem 0 0;
          font-weight: 500;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .btn-header-scan {
          display: none;
          align-items: center;
          gap: 0.4rem;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-header-scan:hover {
          background: #fef3c7;
          border-color: #d97706;
        }
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.75rem;
          background: #ffffff;
          border: 1px solid #e7dfcf;
          border-radius: 9999px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #292524;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        }
        .status-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }
        @media (max-width: 640px) {
          .brand-name {
            font-size: 1.05rem;
          }
          .brand-subtitle {
            display: none;
          }
          .badge-expert {
            display: none;
          }
          .header-container {
            padding: 0.65rem 1rem;
          }
          .btn-header-scan {
            display: inline-flex;
          }
          .btn-header-scan .btn-text {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};
