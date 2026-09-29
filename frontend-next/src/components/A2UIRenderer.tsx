"use client";

import React from "react";
import { SpotlightCard } from "./reactbits/SpotlightCard";
import { A2UIMessage, A2UIComponentSpec } from "../types/a2ui";

interface A2UIRendererProps {
  messages: A2UIMessage[];
}

export const A2UIRenderer: React.FC<A2UIRendererProps> = ({ messages }) => {
  if (!messages || messages.length === 0) return null;

  const boundStr = (v: any): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v.literalString === "string") return v.literalString;
    return "";
  };

  const childIds = (props: any): string[] => {
    const ids: string[] = [];
    if (props && typeof props.child === "string") ids.push(props.child);
    const ch = props && props.children;
    if (ch && Array.isArray(ch.explicitList)) {
      for (const c of ch.explicitList) {
        if (typeof c === "string") ids.push(c);
      }
    }
    return ids;
  };

  // Build component registry
  const comps: Record<string, any> = {};
  const roots: string[] = [];

  for (const m of messages) {
    if (m.beginRendering && typeof m.beginRendering.root === "string") {
      roots.push(m.beginRendering.root);
    }
    const su = m.surfaceUpdate;
    if (su && Array.isArray(su.components)) {
      for (const c of su.components) {
        if (c && c.id && c.component) {
          comps[c.id] = c.component;
        }
      }
    }
  }

  let rootIds = roots.filter((r) => comps[r]);
  if (rootIds.length === 0) {
    const referenced = new Set<string>();
    for (const id in comps) {
      const spec = comps[id];
      const firstKey = Object.keys(spec)[0];
      if (firstKey) {
        childIds(spec[firstKey] || {}).forEach((c) => referenced.add(c));
      }
    }
    rootIds = Object.keys(comps).filter((id) => !referenced.has(id));
  }

  const renderComponentNode = (
    id: string,
    seen = new Set<string>()
  ): React.ReactNode => {
    if (seen.has(id)) return null;
    seen.add(id);

    const spec = comps[id];
    if (!spec) return null;

    const type = Object.keys(spec)[0];
    const props = spec[type] || {};

    switch (type) {
      case "Card": {
        const cIds = childIds(props);
        return (
          <SpotlightCard key={id} className="a2-card-spotlight">
            <div className="a2-card-content">
              {cIds.map((cid) => renderComponentNode(cid, seen))}
            </div>
          </SpotlightCard>
        );
      }
      case "Column": {
        const cIds = childIds(props);
        return (
          <div key={id} className="a2-col">
            {cIds.map((cid) => renderComponentNode(cid, seen))}
          </div>
        );
      }
      case "Row": {
        const cIds = childIds(props);
        const dist = boundStr(props.distribution);
        const isBetween = dist === "spaceBetween";
        return (
          <div key={id} className={`a2-row ${isBetween ? "between" : ""}`}>
            {cIds.map((cid) => renderComponentNode(cid, seen))}
          </div>
        );
      }
      case "Text": {
        const text = boundStr(props.text);
        const hint = boundStr(props.usageHint);
        let cls = "a2-text";
        if (hint === "h1") cls += " a2-h1";
        else if (hint === "h2") cls += " a2-h2";
        else if (hint === "h3") cls += " a2-h3";
        else if (hint === "h4") cls += " a2-h4";
        else if (hint === "caption") cls += " a2-caption";
        return (
          <p key={id} className={cls}>
            {text}
          </p>
        );
      }
      case "Divider": {
        return <hr key={id} className="a2-divider" />;
      }
      case "List": {
        const cIds = childIds(props);
        return (
          <div key={id} className="a2-list">
            {cIds.map((cid) => renderComponentNode(cid, seen))}
          </div>
        );
      }
      case "Image": {
        const url = boundStr(props.url);
        if (!/^https?:\/\//i.test(url)) return null;
        const alt = boundStr(props.accessibilityLabel) || "A2UI Item";
        return (
          <div key={id} className="a2-img-wrap">
            <img src={url} alt={alt} className="a2-img" loading="lazy" />
          </div>
        );
      }
      case "Icon": {
        const name = boundStr(props.name);
        return (
          <span key={id} className="material-symbols-outlined a2-icon">
            {name}
          </span>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="a2ui-surface">
      {rootIds.map((rid) => renderComponentNode(rid))}
      <style jsx>{`
        .a2ui-surface {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 0.5rem;
          width: 100%;
        }
        :global(.a2-card-spotlight) {
          border-radius: 14px;
          border: 1px solid rgba(217, 119, 6, 0.25);
          background: #ffffff;
        }
        .a2-card-content {
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .a2-col {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .a2-row {
          display: flex;
          flex-direction: row;
          gap: 0.65rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .a2-row.between {
          justify-content: space-between;
        }
        .a2-text {
          margin: 0;
          line-height: 1.45;
          color: #292524;
        }
        .a2-text.a2-h1 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #78350f;
        }
        .a2-text.a2-h2 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #78350f;
        }
        .a2-text.a2-h3 {
          font-size: 1.05rem;
          font-weight: 600;
          color: #92400e;
        }
        .a2-text.a2-h4 {
          font-size: 0.95rem;
          font-weight: 600;
        }
        .a2-text.a2-caption {
          font-size: 0.82rem;
          color: #78716c;
        }
        .a2-divider {
          border: none;
          border-top: 1px solid #e7dfcf;
          margin: 0.4rem 0;
          width: 100%;
        }
        .a2-img-wrap {
          border-radius: 10px;
          overflow: hidden;
          margin: 0.35rem 0;
        }
        .a2-img {
          width: 100%;
          max-height: 380px;
          object-fit: cover;
          display: block;
        }
        .a2-icon {
          font-size: 1.25rem;
          color: #d97706;
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
};
