"use client";

import Image from "next/image";

interface SpeechBubbleProps {
  /** Text shown as aria-label for accessibility (screen readers) */
  text: string;
  /** Icon image path shown inside the bubble (replaces visible text) */
  icon?: string;
  visible: boolean;
  /** Direction the pointer points — "left" means character is on the left, "bottom" means character is below */
  pointer?: "left" | "bottom";
}

export default function SpeechBubble({ text, icon, visible, pointer = "left" }: SpeechBubbleProps) {
  if (!visible || (!text && !icon)) return null;

  return (
    <div className="relative max-w-[260px] animate-slide-in">
      {/* Bubble body */}
      <div className={`card-pillow flex items-center justify-center ${icon ? "px-3 py-2" : "px-4 py-3"}`}>
        {icon ? (
          <Image
            src={icon}
            alt={text}
            width={80}
            height={80}
            className="object-contain"
            style={{ width: 80, height: "auto" }}
          />
        ) : (
          <p className="font-bold text-sm leading-snug" style={{ color: "var(--ck-text)" }}>
            {text}
          </p>
        )}
      </div>

      {pointer === "left" && (
        /* Triangle pointer — left side, pointing toward character on the left */
        <div className="absolute top-1/2 -left-2.5 -translate-y-1/2">
          <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
            <path d="M 12 2 L 2 8 L 12 14" fill="white" stroke="var(--ck-border)" strokeWidth="2.5" />
            <rect x="9" y="0" width="3" height="16" fill="white" />
          </svg>
        </div>
      )}

      {pointer === "bottom" && (
        /* Triangle pointer — bottom center, pointing down toward character below */
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M 2 0 L 8 10 L 14 0" fill="white" stroke="var(--ck-border)" strokeWidth="2.5" />
            <rect x="0" y="0" width="16" height="3" fill="white" />
          </svg>
        </div>
      )}
    </div>
  );
}
