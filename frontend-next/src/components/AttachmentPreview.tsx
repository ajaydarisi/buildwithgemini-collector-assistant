"use client";

import React from "react";
import { X, Image as ImageIcon } from "lucide-react";

interface AttachmentPreviewProps {
  imageData: string | null;
  onClear: () => void;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  imageData,
  onClear,
}) => {
  if (!imageData) return null;

  return (
    <div className="attachment-badge">
      <div className="attachment-content">
        <div className="thumb-wrap">
          <img src={imageData} alt="Snapshot preview" className="thumb-img" />
        </div>
        <div className="attachment-info">
          <span className="attachment-title">Ready for inspection</span>
          <span className="attachment-sub">Camera snapshot staged</span>
        </div>
      </div>
      <button
        type="button"
        className="btn-clear-attachment"
        onClick={onClear}
        title="Remove snapshot"
      >
        <X size={14} />
      </button>

      <style jsx>{`
        .attachment-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: #ffffff;
          border: 1px solid #d97706;
          box-shadow: 0 4px 14px rgba(180, 83, 9, 0.12);
          border-radius: 12px;
          padding: 0.35rem 0.65rem 0.35rem 0.35rem;
          margin: 0 1.25rem 0.5rem;
          max-width: fit-content;
          animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .attachment-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .thumb-wrap {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          overflow: hidden;
          background: #000;
          flex-shrink: 0;
          border: 1px solid #e7dfcf;
        }
        .thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .attachment-info {
          display: flex;
          flex-direction: column;
        }
        .attachment-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #78350f;
          line-height: 1.2;
        }
        .attachment-sub {
          font-size: 0.68rem;
          color: #78716c;
        }
        .btn-clear-attachment {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          padding: 0;
        }
        .btn-clear-attachment:hover {
          background: #fca5a5;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 640px) {
          .attachment-badge {
            margin: 0 1rem 0.4rem;
          }
        }
      `}</style>
    </div>
  );
};
