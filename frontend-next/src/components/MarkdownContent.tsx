"use client";

import React from "react";

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  if (!content) return null;

  const parseContent = (text: string) => {
    let safe = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Images and Videos: ![alt](url)
    safe = safe.replace(/!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)/g, (match, alt, url) => {
      const isVideo = url.match(/\.(mp4|webm|mov)(\?.*)?$/i);
      if (isVideo) {
        return `<div class="chat-media-wrapper"><div class="media-video-container"><video controls playsinline class="chat-video" src="${url}" preload="metadata"></video></div><span class="media-caption">🎬 ${alt || "Video Showcase"}</span></div>`;
      }
      return `<div class="chat-media-wrapper"><div class="media-image-container"><img class="chat-image" src="${url}" alt="${alt || "Showcase"}" loading="lazy" /></div><span class="media-caption">🖼️ ${alt || "Showcase Specimen"}</span></div>`;
    });

    // Standalone URLs
    safe = safe.replace(/(^|[^"'])(https?:\/\/[^\s\)<>]+)/g, (match, prefix, url) => {
      if (url.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
        return `${prefix}<div class="chat-media-wrapper"><div class="media-image-container"><img class="chat-image" src="${url}" alt="Specimen" loading="lazy" /></div></div>`;
      }
      if (url.match(/\.(mp4|webm|mov)(\?.*)?$/i)) {
        return `${prefix}<div class="chat-media-wrapper"><div class="media-video-container"><video controls playsinline class="chat-video" src="${url}" preload="metadata"></video></div></div>`;
      }
      return `${prefix}<a class="chat-link" href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    // Headings
    safe = safe.replace(/^### (.*$)/gim, '<h3 class="msg-h3 font-headline text-lg font-semibold text-primary mt-3 mb-1">$1</h3>');
    safe = safe.replace(/^## (.*$)/gim, '<h2 class="msg-h2 font-headline text-xl font-medium text-primary mt-4 mb-2">$1</h2>');

    // Bold & Italic
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-primary">$1</strong>');
    safe = safe.replace(/\*(.*?)\*/g, '<em class="italic text-on-surface-variant font-display">$1</em>');

    // Code
    safe = safe.replace(/`([^`]+)`/g, '<code class="msg-code bg-surface-raised px-1.5 py-0.5 rounded text-primary text-xs font-mono">$1</code>');

    // Lists
    safe = safe.replace(/^[•*-] (.*$)/gim, '<div class="msg-li flex items-start gap-2 my-1"><span class="text-gilded-amber font-bold leading-none mt-1">•</span><span class="text-on-surface text-sm md:text-base leading-relaxed">$1</span></div>');

    // Dividers
    safe = safe.replace(/^---$/gim, '<hr class="my-3 border-border-antique" />');

    // Paragraphs
    safe = safe.replace(/\n\n+/g, "</p><p class='mt-2.5 leading-relaxed text-sm md:text-base text-on-surface'>").replace(/\n/g, "<br />");

    return `<p class="leading-relaxed text-sm md:text-base text-on-surface">${safe}</p>`;
  };

  return (
    <div
      className="prose-concierge"
      dangerouslySetInnerHTML={{ __html: parseContent(content) }}
    />
  );
};
