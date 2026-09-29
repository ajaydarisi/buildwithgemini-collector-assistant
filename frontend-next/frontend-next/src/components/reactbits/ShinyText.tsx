"use client";

import React from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 5,
  className = "",
}) => {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`shiny-text-root ${disabled ? "disabled" : ""} ${className}`}
      style={{ animationDuration }}
    >
      {text}
      <style jsx>{`
        .shiny-text-root {
          color: #78350f;
          background: linear-gradient(
            120deg,
            #78350f 0%,
            #b45309 30%,
            #fbbf24 50%,
            #b45309 70%,
            #78350f 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          animation: shine var(--speed, 4s) linear infinite;
        }
        @keyframes shine {
          0% {
            background-position: 100%;
          }
          100% {
            background-position: -100%;
          }
        }
        .shiny-text-root.disabled {
          animation: none;
        }
      `}</style>
    </span>
  );
};
