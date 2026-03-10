"use client";

interface SpeechBubbleProps {
  text: string;
  visible: boolean;
}

export default function SpeechBubble({ text, visible }: SpeechBubbleProps) {
  if (!visible || !text) return null;

  return (
    <div className="relative max-w-[260px] animate-slide-in">
      {/* Bubble body */}
      <div className="card-pillow px-4 py-3">
        <p className="font-bold text-sm leading-snug" style={{ color: "var(--ck-text)" }}>
          {text}
        </p>
      </div>

      {/* Triangle pointer — left side, pointing toward mascot */}
      <div className="absolute top-1/2 -left-2.5 -translate-y-1/2">
        <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
          <path d="M 12 2 L 2 8 L 12 14" fill="white" stroke="var(--ck-border)" strokeWidth="2.5" />
          {/* Cover the right border */}
          <rect x="9" y="0" width="3" height="16" fill="white" />
        </svg>
      </div>
    </div>
  );
}
