"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, Send, ArrowUp } from "lucide-react";

interface InputDockProps {
  onSendMessage: (text: string) => void;
  onOpenScanner: () => void;
  isLoading: boolean;
  hasAttachment?: boolean;
}

export const InputDock: React.FC<InputDockProps> = ({
  onSendMessage,
  onOpenScanner,
  isLoading,
  hasAttachment = false,
}) => {
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    if (!inputVal.trim() && !hasAttachment) return;

    onSendMessage(inputVal);
    setInputVal("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="input-dock-container">
      <form className="input-form" onSubmit={handleSubmit}>
        <button
          type="button"
          className="btn-dock-camera"
          onClick={onOpenScanner}
          disabled={isLoading}
          title="Open camera scanner"
        >
          <Camera size={18} className="camera-icon" />
          <span className="camera-label">Scan</span>
        </button>

        <div className="input-field-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="input-text"
            placeholder={
              hasAttachment
                ? "Add an appraisal question, or press Send..."
                : "Ask about rare cards, appraisals, market prices, or scan an item..."
            }
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="btn-dock-send"
          disabled={isLoading || (!inputVal.trim() && !hasAttachment)}
          title="Send message"
        >
          <ArrowUp size={18} />
        </button>
      </form>

      <style jsx>{`
        .input-dock-container {
          padding: 0.5rem 1.25rem 1.25rem;
          max-width: 960px;
          margin: 0 auto;
          width: 100%;
        }
        .input-form {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: #ffffff;
          border: 1px solid #e7dfcf;
          border-radius: 20px;
          padding: 0.45rem 0.6rem;
          box-shadow: 0 4px 20px -2px rgba(69, 26, 3, 0.08);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .input-form:focus-within {
          border-color: #d97706;
          box-shadow: 0 4px 24px -2px rgba(217, 119, 6, 0.2);
        }
        .btn-dock-camera {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          font-weight: 700;
          font-size: 0.82rem;
          padding: 0.5rem 0.85rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .btn-dock-camera:hover:not(:disabled) {
          background: #fef3c7;
          border-color: #d97706;
          transform: translateY(-1px);
        }
        .btn-dock-camera:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .camera-icon {
          color: #d97706;
        }
        .input-field-wrapper {
          flex: 1;
          display: flex;
        }
        .input-text {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-size: 0.95rem;
          color: #292524;
          padding: 0.4rem 0.5rem;
        }
        .input-text::placeholder {
          color: #a8a29e;
          font-size: 0.9rem;
        }
        .btn-dock-send {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          border: none;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(180, 83, 9, 0.25);
        }
        .btn-dock-send:hover:not(:disabled) {
          background: linear-gradient(135deg, #b45309 0%, #92400e 100%);
          transform: translateY(-1px) scale(1.04);
          box-shadow: 0 4px 10px rgba(180, 83, 9, 0.35);
        }
        .btn-dock-send:disabled {
          background: #e7dfcf;
          color: #a8a29e;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }
        @media (max-width: 640px) {
          .input-dock-container {
            padding: 0.35rem 1rem 1rem;
          }
          .camera-label {
            display: none;
          }
          .btn-dock-camera {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};
