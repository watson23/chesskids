"use client";

import { useEffect, useRef } from "react";
import Piku from "@/components/Piku";
import SpeechBubble from "@/components/SpeechBubble";
import TapHint from "@/components/TapHint";
import { useLocale } from "@/hooks/useLocale";

interface JourneyMapOnboardingProps {
  x: number;
  y: number;
  onDismiss: () => void;
}

/**
 * First-time onboarding overlay near lesson 0 on the journey map.
 * Shows mascot with speech bubble + TapHint. Auto-dismisses after 10s or on tap.
 */
export default function JourneyMapOnboarding({
  x,
  y,
  onDismiss,
}: JourneyMapOnboardingProps) {
  const { t } = useLocale();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, 10000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onDismiss]);

  return (
    <button
      className="absolute z-10 flex flex-col items-center gap-2 -translate-x-1/2 animate-slide-in"
      style={{ left: `${x}%`, top: `${y - 12}%` }}
      onClick={onDismiss}
      aria-label="Start your adventure"
    >
      <div className="flex items-end gap-2">
        <Piku expression="happy" size={100} />
        <SpeechBubble text={t("onboarding_start")} visible />
      </div>
      <TapHint visible />
    </button>
  );
}
