"use client";

import React, { useEffect, useRef } from "react";
import { useCamera } from "../hooks/useCamera";
import { X, Camera, RefreshCw, Upload, AlertCircle, Image as ImageIcon } from "lucide-react";

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

  // Distinct refs: one for Gallery (no capture), one for Native Phone Camera (capture="environment")
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  const handleTakeSnapshot = () => {
    if (isStreaming) {
      const dataUrl = captureSnapshot();
      if (dataUrl) {
        onCapture(dataUrl);
        onClose();
      }
    } else {
      // If live WebRTC stream isn't active, invoke native device camera directly
      nativeCameraInputRef.current?.click();
    }
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    e.target.value = "";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-surface-card border border-border-antique rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-antique bg-canvas-linen">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-gilded-amber">
              photo_camera
            </span>
            <span className="font-headline text-lg font-semibold text-primary">
              Collectible Scanner
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-primary hover:bg-surface-raised transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative w-full aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isStreaming ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Framing Target Box */}
          {isStreaming && (
            <div className="absolute inset-8 border-2 border-gilded-amber/60 rounded-xl pointer-events-none flex flex-col items-center justify-between p-2">
              <span className="font-label text-[10px] text-white/90 bg-black/50 px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                Center Item in Frame
              </span>
              <div className="w-6 h-6 border-b-2 border-r-2 border-gilded-amber self-end rounded-br" />
            </div>
          )}

          {/* Fallback / Error State */}
          {(!isStreaming || error) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-surface-card">
              <div className="w-12 h-12 rounded-full bg-primary-container/10 text-primary-container flex items-center justify-center mb-3">
                <Camera size={24} />
              </div>
              <h3 className="font-headline text-lg text-primary font-semibold">
                Capture Collectible Photo
              </h3>
              <p className="font-body text-xs text-on-surface-variant max-w-xs mt-1 mb-4">
                {error
                  ? "Live viewfinder restricted. Tap below to use your phone's native camera or select a photo."
                  : "Tap below to take a photo with your device camera or pick from your photos."}
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label text-xs uppercase tracking-wider font-semibold shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <Camera size={16} />
                  <span>Open Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-surface-raised hover:bg-surface-card text-primary border border-border-antique font-label text-xs uppercase tracking-wider font-semibold shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <ImageIcon size={16} />
                  <span>Choose Photo</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-around py-3 px-4 bg-canvas-linen border-t border-border-antique">
          {/* Photos / Gallery Picker (NEVER opens camera!) */}
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-outline hover:text-primary transition-colors p-1"
            title="Choose from Photos"
          >
            <ImageIcon size={20} />
            <span className="font-label text-[10px] uppercase tracking-wider font-medium">
              Photos
            </span>
          </button>

          {/* Shutter Button */}
          <button
            type="button"
            onClick={handleTakeSnapshot}
            className="w-14 h-14 rounded-full border-4 border-primary p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md"
            title={isStreaming ? "Capture photo" : "Open camera"}
          >
            <div className="w-full h-full rounded-full bg-primary hover:bg-primary-container transition-colors" />
          </button>

          {/* Flip or Native Camera Trigger */}
          {isStreaming ? (
            <button
              type="button"
              onClick={toggleFacingMode}
              className="flex flex-col items-center gap-1 text-outline hover:text-primary transition-colors p-1"
              title="Flip camera"
            >
              <RefreshCw size={20} />
              <span className="font-label text-[10px] uppercase tracking-wider font-medium">
                Flip
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="flex flex-col items-center gap-1 text-outline hover:text-primary transition-colors p-1"
              title="Open device camera"
            >
              <Camera size={20} />
              <span className="font-label text-[10px] uppercase tracking-wider font-medium">
                Camera
              </span>
            </button>
          )}
        </div>

        {/* 1. Dedicated Gallery Input: NO capture attribute, opens photo library */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFilePicked}
        />

        {/* 2. Dedicated Native Phone Camera Input: capture="environment" opens rear camera on iOS & Android */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFilePicked}
        />
      </div>
    </div>
  );
};
