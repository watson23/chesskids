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

      {/* Triangle pointer — bottom-left */}
      <div className="absolute -bottom-2.5 left-6">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M 2 0 L 8 10 L 14 0" fill="white" stroke="var(--ck-border)" strokeWidth="2.5" />
          {/* Cover the top border */}
          <rect x="0" y="0" width="16" height="3" fill="white" />
        </svg>
      </div>
    </div>
  );
}
