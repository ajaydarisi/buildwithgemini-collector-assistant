"use client";

import React from "react";

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`aurora-wrapper ${className}`}>
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="aurora-content">{children}</div>
      <style jsx>{`
        .aurora-wrapper {
          position: relative;
          min-height: 100vh;
          background: #fdfbf7;
          overflow: hidden;
        }
        .aurora-blob {
          position: fixed;
          filter: blur(100px);
          opacity: 0.35;
          pointer-events: none;
          border-radius: 50%;
          z-index: 0;
          animation: float 20s ease-in-out infinite alternate;
        }
        .aurora-blob-1 {
          width: 500px;
          height: 500px;
          top: -150px;
          left: -100px;
          background: radial-gradient(circle, #fde68a 0%, #d97706 60%, transparent 80%);
        }
        .aurora-blob-2 {
          width: 600px;
          height: 600px;
          bottom: -200px;
          right: -150px;
          background: radial-gradient(circle, #fed7aa 0%, #b45309 60%, transparent 80%);
          animation-duration: 25s;
        }
        .aurora-blob-3 {
          width: 400px;
          height: 400px;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, #fef3c7 0%, #fbbf24 50%, transparent 80%);
          opacity: 0.2;
          animation-duration: 30s;
        }
        .aurora-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        @keyframes float {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(40px, -30px) scale(1.08);
          }
          100% {
            transform: translate(-30px, 40px) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
};
