"use client";

import type { ReactNode } from "react";
import { UI } from "@/lib/ui";

interface TopBarProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  /** Float over scrolling content (journey map) instead of taking space. */
  fixed?: boolean;
  className?: string;
}

/**
 * The one top bar. Same height, gutters and safe-area handling on every
 * screen; slots keep the layout balanced even when a side is empty.
 */
export default function TopBar({ left, center, right, fixed = false, className = "" }: TopBarProps) {
  return (
    <div
      className={`${fixed ? "fixed top-0 left-0 right-0 z-30" : "relative"} flex items-center gap-3 px-4 pt-[calc(env(safe-area-inset-top)+8px)] pb-2 ${className}`}
      style={{ minHeight: UI.nav.button + 16 }}
    >
      <div className="flex items-center gap-2 shrink-0" style={{ minWidth: UI.nav.button }}>
        {left}
      </div>
      <div className="flex-1 flex items-center justify-center min-w-0">{center}</div>
      <div className="flex items-center justify-end gap-2 shrink-0" style={{ minWidth: UI.nav.button }}>
        {right}
      </div>
    </div>
  );
}
