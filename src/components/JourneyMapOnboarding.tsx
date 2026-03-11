"use client";

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
 * Full-body Piku stands below-right of the first lesson with a speech bubble
 * pointing down at him. TapHint pulses on the lesson node.
 * Stays visible until the player taps the first lesson (no auto-dismiss).
 */
export default function JourneyMapOnboarding({
  x,
  y,
  onDismiss,
}: JourneyMapOnboardingProps) {
  const { t } = useLocale();

  return (
    <>
      {/* Tap hint on the first lesson node */}
      <div
        className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: `${x}%`, top: `${y}%` }}
      >
        <TapHint visible />
      </div>

      {/* Piku + speech bubble, positioned below-right of lesson 1 */}
      <div
        className="absolute z-10 flex flex-col items-center gap-1 animate-slide-in pointer-events-none"
        style={{ left: `${x + 14}%`, top: `${y + 2}%` }}
      >
        <SpeechBubble text={t("onboarding_start")} visible pointer="bottom" />
        <Piku expression="standing-winking" size={100} />
      </div>
    </>
  );
}
