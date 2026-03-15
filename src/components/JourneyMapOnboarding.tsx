"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import Piku from "@/components/Piku";
import SpeechBubble from "@/components/SpeechBubble";
import { useLocale } from "@/hooks/useLocale";
import { useAudio } from "@/hooks/useAudio";
import { speak } from "@/lib/tts";

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
  const { language, soundEnabled } = useAudio();

  const welcomeText = t("onboarding_start").replace("{name}", childName);

  const replay = useCallback(() => {
    if (!soundEnabled) return;
    speak(welcomeText, { lang: language });
  }, [welcomeText, language, soundEnabled]);

  // Speak on mount
  useEffect(() => {
    replay();
  }, [replay]);

  return (
    <div
      className="absolute z-10 flex flex-col items-center gap-1 animate-slide-in pointer-events-none"
      style={{ left: `${x + 14}%`, bottom: "2%", position: "absolute" }}
    >
      <div className="flex items-end gap-1">
        <SpeechBubble text={welcomeText} visible pointer="bottom" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            replay();
          }}
          className="pointer-events-auto flex-shrink-0 p-1.5 active:scale-90 transition-transform animate-gentle-bounce"
          aria-label="Replay audio"
        >
          <Image
            src="/icons/icon-sound-on.webp"
            alt="Replay"
            width={32}
            height={32}
            className="object-contain drop-shadow-md"
          />
        </button>
      </div>
      <Piku expression="standing-winking" size={100} />
    </div>
  );
}
