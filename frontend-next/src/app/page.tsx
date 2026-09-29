"use client";

import React, { useState } from "react";
import { Header } from "../components/Header";
import { ChatLog } from "../components/ChatLog";
import { InputDock } from "../components/InputDock";
import { CameraModal } from "../components/CameraModal";
import { useChat } from "../hooks/useChat";

export default function Home() {
  const { messages, isLoading, sendMessage } = useChat();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [stagedImage, setStagedImage] = useState<string | null>(null);

  const handleCapturePhoto = (dataUrl: string) => {
    setStagedImage(dataUrl);
    setIsScannerOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setStagedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSelectPrompt = (prompt: string) => {
    sendMessage(prompt, stagedImage);
    setStagedImage(null);
  };

  return (
    <div className="relative min-h-screen bg-canvas-linen flex flex-col selection:bg-primary selection:text-canvas-linen">
      {/* Header */}
      <Header onOpenScanner={() => setIsScannerOpen(true)} />

      {/* Main Chat Stream */}
      <main className="w-full flex-1 flex flex-col items-center">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-20 md:pt-24 pb-36">
          <ChatLog messages={messages} />
        </div>
      </main>

      {/* Minimal Input Deck */}
      <InputDock
        onSendMessage={sendMessage}
        isLoading={isLoading}
        stagedImage={stagedImage}
        onClearStagedImage={() => setStagedImage(null)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onSelectPrompt={handleSelectPrompt}
        onFileSelect={handleFileSelect}
      />

      {/* Camera Viewfinder Modal */}
      <CameraModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCapture={handleCapturePhoto}
      />
    </div>
  );
}
