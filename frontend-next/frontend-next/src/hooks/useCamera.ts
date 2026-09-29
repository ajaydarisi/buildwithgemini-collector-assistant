"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = useCallback(async (mode: "environment" | "user" = facingMode) => {
    setError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Live camera stream is not supported in this browser context (HTTPS required on mobile). Use the native camera button below.");
      }

      let mediaStream: MediaStream;

      // Tier 1: Try flexible facingMode with ideal dimensions
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err1) {
        // Tier 2: Fallback to basic facingMode without resolution constraints
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode },
            audio: false,
          });
        } catch (err2) {
          // Tier 3: Fallback to any available video stream
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      setStream(mediaStream);
      setFacingMode(mode);
      setIsStreaming(true);

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        video.setAttribute("playsinline", "true");
        video.setAttribute("webkit-playsinline", "true");
        video.muted = true;
        try {
          await video.play();
        } catch (playErr) {
          console.warn("Autoplay was prevented, user gesture required:", playErr);
        }
      }
    } catch (err: any) {
      console.warn("Camera initialization error:", err);
      setIsStreaming(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera permission was denied. Tap 'Use Native Camera' or 'Choose from Photos'.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No camera device was detected. Tap 'Choose from Photos'.");
      } else {
        setError(err.message || "Unable to start live viewfinder. Tap 'Use Native Camera'.");
      }
    }
  }, [facingMode, stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, [stream]);

  const toggleFacingMode = useCallback(() => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    startCamera(nextMode);
  }, [facingMode, startCamera]);

  const captureSnapshot = useCallback((): string | null => {
    if (!videoRef.current || !isStreaming) return null;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const width = video.videoWidth || 800;
    const height = video.videoHeight || 600;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.9);
  }, [isStreaming]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return {
    videoRef,
    isStreaming,
    error,
    facingMode,
    startCamera,
    stopCamera,
    toggleFacingMode,
    captureSnapshot,
  };
}
