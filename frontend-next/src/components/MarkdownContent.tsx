"use client";

import React from "react";
import { ExternalLink, Play } from "lucide-react";

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  if (!content) return null;

  // Formatter for rich text, markdown images, videos, and headings
  const parseContent = (text: string) => {
    // 1. Sanitize angle brackets but leave safe markdown
    let safe = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 2. Images and Videos: ![alt](url)
    safe = safe.replace(/!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)/g, (match, alt, url) => {
      const isVideo = url.match(/\.(mp4|webm|mov)(\?.*)?$/i);
      if (isVideo) {
        return `<div class="chat-media-wrapper"><div class="media-video-container"><video controls playsinline class="chat-video" src="${url}" preload="metadata"></video></div><span class="media-caption">🎬 ${alt || "Video Showcase"}</span></div>`;
      }
      return `<div class="chat-media-wrapper"><div class="media-image-container"><img class="chat-image" src="${url}" alt="${alt || "Showcase"}" loading="lazy" /></div><span class="media-caption">🖼️ ${alt || "Showcase Image"}</span></div>`;
    });

    // 3. Standalone URLs (excluding those already in tags)
    safe = safe.replace(/(^|[^"'])(https?:\/\/[^\s\)<>]+)/g, (match, prefix, url) => {
      if (url.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
        return `${prefix}<div class="chat-media-wrapper"><div class="media-image-container"><img class="chat-image" src="${url}" alt="Image" loading="lazy" /></div></div>`;
      }
      if (url.match(/\.(mp4|webm|mov)(\?.*)?$/i)) {
        return `${prefix}<div class="chat-media-wrapper"><div class="media-video-container"><video controls playsinline class="chat-video" src="${url}" preload="metadata"></video></div></div>`;
      }
      return `${prefix}<a class="chat-link" href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    // 4. Headings: ### Title, ## Title
    safe = safe.replace(/^### (.*$)/gim, '<h3 class="msg-h3">$1</h3>');
    safe = safe.replace(/^## (.*$)/gim, '<h2 class="msg-h2">$1</h2>');

    // 5. Bold & Italic
    safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // 6. Code inline & blocks
    safe = safe.replace(/`([^`]+)`/g, '<code class="msg-code">$1</code>');

    // 7. Unordered lists
    safe = safe.replace(/^[•*-] (.*$)/gim, '<div class="msg-li"><span class="bullet">•</span><span>$1</span></div>');

    // 8. Horizontal rules
    safe = safe.replace(/^---$/gim, '<hr class="msg-hr" />');

    // 9. Paragraphs and breaks
    safe = safe.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br />");

    return "<p>" + safe + "</p>";
  };

  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: parseContent(content) }}
    />
  );
};
