"use client";

import { useLocale } from "@/hooks/useLocale";

interface TapHintProps {
  visible: boolean;
}

/** Pulsing hand icon that hints the player should tap a piece */
export default function TapHint({ visible }: TapHintProps) {
  const { t } = useLocale();

  if (!visible) return null;

  return (
    <div className="flex items-center gap-2 animate-tap-hint pointer-events-none" style={{ fontSize: "clamp(13px, 3.5vw, 16px)" }}>
      {/* Hand/finger SVG */}
      <svg style={{ width: "clamp(24px, 7vw, 32px)", height: "clamp(24px, 7vw, 32px)" }} viewBox="0 0 24 24" fill="none">
        {/* Finger pointing down */}
        <path
          d="M12 2 C10.5 2 9.5 3 9.5 4.5 L9.5 13 L7.5 11 C6.5 10 5 10.5 5 12 L5 13 L9 18 C9.5 18.7 10.5 20 12 20 L16 20 C17.5 20 19 18.5 19 17 L19 9 C19 7.5 18 7 17 7 C16.5 7 16 7.2 15.5 7.5 L15.5 6 C15.5 5 14.5 4 13.5 4.5 L13.5 4.5 C13.5 3 12.5 2 12 2 Z"
          fill="var(--ck-gold)"
          stroke="var(--ck-gold-dark)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-bold" style={{ color: "var(--ck-text-light)" }}>
        {t("tap_hint")}
      </span>
    </div>
  );
}
