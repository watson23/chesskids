"use client";

import Piku from "@/components/Piku";
import SpeechBubble from "@/components/SpeechBubble";
import { useLocale } from "@/hooks/useLocale";

interface JourneyMapOnboardingProps {
  x: number;
  y: number;
  childName: string;
  onDismiss: () => void;
}

/**
 * First-time onboarding overlay on the journey map.
 * Full-body Piku stands at the bottom-right of the map with a welcoming
 * speech bubble. Stays visible until the player taps the first lesson.
 */
export default function JourneyMapOnboarding({
  x,
  y,
  childName,
  onDismiss,
}: JourneyMapOnboardingProps) {
  const { t } = useLocale();

  const welcomeText = t("onboarding_start").replace("{name}", childName);

  return (
    <div
      className="absolute z-10 flex flex-col items-center gap-1 animate-slide-in pointer-events-none"
      style={{ left: `${x + 14}%`, bottom: "2%", position: "absolute" }}
    >
      <SpeechBubble text={welcomeText} visible pointer="bottom" />
      <Piku expression="standing-winking" size={100} />
    </div>
  );
}
