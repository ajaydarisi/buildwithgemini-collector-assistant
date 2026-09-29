"use client";

import React, { useEffect, useRef } from "react";
import { useCamera } from "../hooks/useCamera";
import { X, Camera, RefreshCw, Upload, AlertCircle } from "lucide-react";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const {
    videoRef,
    isStreaming,
    error,
    facingMode,
    startCamera,
    stopCamera,
    toggleFacingMode,
    captureSnapshot,
  } = useCamera();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  const handleTakeSnapshot = () => {
    const dataUrl = captureSnapshot();
    if (dataUrl) {
      onCapture(dataUrl);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onCapture(dataUrl);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="camera-modal-backdrop" onClick={onClose}>
      <div
        className="camera-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="camera-modal-header">
          <div className="header-info">
            <Camera size={18} className="camera-icon" />
            <span className="modal-title">Collectible Scanner</span>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            title="Close camera"
          >
            <X size={18} />
          </button>
        </div>

        <div className="camera-viewport-container">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`camera-video ${isStreaming ? "visible" : ""}`}
          />

          {/* Framing Target Box */}
          <div className="framing-reticle">
            <div className="reticle-corner top-left" />
            <div className="reticle-corner top-right" />
            <div className="reticle-corner bottom-left" />
            <div className="reticle-corner bottom-right" />
            <span className="reticle-caption">Center item in frame</span>
          </div>

          {error && (
            <div className="camera-error-banner">
              <AlertCircle size={24} className="err-icon" />
              <p className="err-text">{error}</p>
              <button
                type="button"
                className="btn-fallback-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} />
                <span>Upload Photo Instead</span>
              </button>
            </div>
          )}
        </div>

        <div className="camera-modal-footer">
          <button
            type="button"
            className="btn-action-secondary"
            onClick={() => fileInputRef.current?.click()}
            title="Upload from device"
          >
            <Upload size={18} />
            <span className="btn-label">Upload</span>
          </button>

          <button
            type="button"
            className="btn-shutter"
            onClick={handleTakeSnapshot}
            disabled={!isStreaming}
            title="Capture snapshot"
          >
            <div className="shutter-inner" />
          </button>

          <button
            type="button"
            className="btn-action-secondary"
            onClick={toggleFacingMode}
            disabled={!isStreaming}
            title="Flip camera"
          >
            <RefreshCw size={18} />
            <span className="btn-label">Flip</span>
          </button>
        </div>

        {/* Hidden fallback file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
      </div>

      <style jsx>{`
        .camera-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }
        .camera-modal-dialog {
          width: 100%;
          max-width: 540px;
          background: #1c1917;
          border-radius: 20px;
          border: 1px solid rgba(217, 119, 6, 0.35);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .camera-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          background: #292524;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .header-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #fef3c7;
        }
        .camera-icon {
          color: #d97706;
        }
        .modal-title {
          font-family: var(--font-heading, "Cinzel", Georgia, serif);
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .btn-modal-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #d6d3d1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
        .camera-viewport-container {
          position: relative;
          width: 100%;
          height: 360px;
          background: #0c0a09;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .camera-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .camera-video.visible {
          opacity: 1;
        }
        .framing-reticle {
          position: absolute;
          width: 70%;
          height: 75%;
          border: 1px dashed rgba(251, 191, 36, 0.4);
          border-radius: 12px;
          pointer-events: none;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 0.75rem;
        }
        .reticle-corner {
          position: absolute;
          width: 18px;
          height: 18px;
          border-color: #fbbf24;
          border-style: solid;
        }
        .top-left {
          top: -2px;
          left: -2px;
          border-width: 3px 0 0 3px;
          border-top-left-radius: 6px;
        }
        .top-right {
          top: -2px;
          right: -2px;
          border-width: 3px 3px 0 0;
          border-top-right-radius: 6px;
        }
        .bottom-left {
          bottom: -2px;
          left: -2px;
          border-width: 0 0 3px 3px;
          border-bottom-left-radius: 6px;
        }
        .bottom-right {
          bottom: -2px;
          right: -2px;
          border-width: 0 3px 3px 0;
          border-bottom-right-radius: 6px;
        }
        .reticle-caption {
          font-size: 0.75rem;
          color: #fef3c7;
          background: rgba(0, 0, 0, 0.65);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
        .camera-error-banner {
          position: absolute;
          inset: 0;
          background: rgba(28, 25, 23, 0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          text-align: center;
          color: #fef2f2;
          gap: 0.75rem;
        }
        .err-icon {
          color: #ef4444;
        }
        .err-text {
          font-size: 0.88rem;
          line-height: 1.4;
          max-width: 340px;
          color: #fca5a5;
          margin: 0;
        }
        .btn-fallback-upload {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #d97706;
          color: #ffffff;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 0.55rem 1rem;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .btn-fallback-upload:hover {
          background: #b45309;
        }
        .camera-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 1.25rem 1rem;
          background: #1c1917;
        }
        .btn-action-secondary {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          background: transparent;
          border: none;
          color: #d6d3d1;
          cursor: pointer;
          font-size: 0.75rem;
          transition: color 0.2s ease;
        }
        .btn-action-secondary:hover:not(:disabled) {
          color: #fbbf24;
        }
        .btn-action-secondary:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .btn-shutter {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          border: 4px solid #ffffff;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s ease;
          padding: 0;
        }
        .btn-shutter:hover:not(:disabled) {
          transform: scale(1.06);
        }
        .btn-shutter:active:not(:disabled) {
          transform: scale(0.94);
        }
        .btn-shutter:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .shutter-inner {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          box-shadow: 0 0 12px rgba(217, 119, 6, 0.6);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @media (max-width: 640px) {
          .camera-modal-backdrop {
            padding: 0;
          }
          .camera-modal-dialog {
            height: 100%;
            max-width: 100%;
            border-radius: 0;
          }
          .camera-viewport-container {
            flex: 1;
            height: auto;
          }
        }
      `}</style>
    </div>
  );
};
