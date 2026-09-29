"use client";

import React, { useState } from "react";
import { AuroraBackground } from "../components/reactbits/AuroraBackground";
import { Header } from "../components/Header";
import { ChatLog } from "../components/ChatLog";
import { PromptChips } from "../components/PromptChips";
import { AttachmentPreview } from "../components/AttachmentPreview";
import { InputDock } from "../components/InputDock";
import { CameraModal } from "../components/CameraModal";
import { useChat } from "../hooks/useChat";

export default function Home() {
  const { messages, isLoading, sendMessage } = useChat();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stagedImage, setStagedImage] = useState<string | null>(null);

  const handleOpenScanner = () => {
    setIsCameraOpen(true);
  };

  const handleCloseScanner = () => {
    setIsCameraOpen(false);
  };

  const handleCaptureSnapshot = (dataUrl: string) => {
    setStagedImage(dataUrl);
  };

  const handleClearStagedImage = () => {
    setStagedImage(null);
  };

  const handleSendMessage = (text: string) => {
    sendMessage(text, stagedImage);
    setStagedImage(null);
  };

  const handleSelectPrompt = (promptText: string) => {
    sendMessage(promptText, stagedImage);
    setStagedImage(null);
  };

  return (
    <AuroraBackground>
      <div className="main-layout-root">
        <Header onOpenScanner={handleOpenScanner} />

        <main className="chat-container">
          <ChatLog messages={messages} />
        </main>

        <footer className="footer-controls">
          <AttachmentPreview
            imageData={stagedImage}
            onClear={handleClearStagedImage}
          />
          <PromptChips
            onSelectPrompt={handleSelectPrompt}
            onOpenScanner={handleOpenScanner}
            disabled={isLoading}
          />
          <InputDock
            onSendMessage={handleSendMessage}
            onOpenScanner={handleOpenScanner}
            isLoading={isLoading}
            hasAttachment={!!stagedImage}
          />
        </footer>

        <CameraModal
          isOpen={isCameraOpen}
          onClose={handleCloseScanner}
          onCapture={handleCaptureSnapshot}
        />
      </div>

      <style jsx>{`
        .main-layout-root {
          display: flex;
          flex-direction: column;
          height: 100vh;
          height: 100dvh;
          width: 100%;
          overflow: hidden;
        }
        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }
        .footer-controls {
          display: flex;
          flex-direction: column;
          background: rgba(253, 251, 247, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top: 1px solid rgba(231, 223, 207, 0.8);
          z-index: 20;
        }
      `}</style>
    </AuroraBackground>
  );
}
