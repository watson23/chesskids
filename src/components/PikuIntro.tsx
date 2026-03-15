"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import Piku from "@/components/Piku";
import SpeechBubble from "@/components/SpeechBubble";
import { useLocale } from "@/hooks/useLocale";
import { useAudio } from "@/hooks/useAudio";
import { speak } from "@/lib/tts";

interface PikuIntroProps {
  childName: string;
  onContinue: () => void;
}

/**
 * Full-screen intro where Piku greets a new player by name.
 * Shown once when a new child profile is created, before the journey map.
 */
export default function PikuIntro({ childName, onContinue }: PikuIntroProps) {
  const { t } = useLocale();
  const { language, soundEnabled } = useAudio();

  const greeting = t("piku_intro_greeting").replace("{name}", childName);

  const replay = useCallback(() => {
    if (!soundEnabled) return;
    speak(greeting, { lang: language });
  }, [greeting, language, soundEnabled]);

  // Speak greeting on mount
  useEffect(() => {
    replay();
  }, [replay]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at 50% 40%, #E0E7FF 0%, #C7D2FE 35%, #A5B4FC 70%, #818CF8 100%)",
      }}
    >
      {/* Sparkle decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[12%] left-[15%] text-4xl animate-gentle-bounce" style={{ animationDelay: "0s" }}>✨</div>
        <div className="absolute top-[8%] right-[20%] text-3xl animate-gentle-bounce" style={{ animationDelay: "0.5s" }}>⭐</div>
        <div className="absolute top-[25%] right-[10%] text-2xl animate-gentle-bounce" style={{ animationDelay: "1s" }}>✨</div>
        <div className="absolute bottom-[25%] left-[10%] text-2xl animate-gentle-bounce" style={{ animationDelay: "0.7s" }}>⭐</div>
        <div className="absolute bottom-[30%] right-[15%] text-3xl animate-gentle-bounce" style={{ animationDelay: "0.3s" }}>✨</div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center gap-4 animate-slide-in">
        {/* Piku mascot */}
        <div className="drop-shadow-xl">
          <Piku expression="wave" size={200} />
        </div>

        {/* Speech bubble with greeting */}
        <div className="flex items-center gap-2 max-w-[340px]">
          <SpeechBubble text={greeting} visible pointer="bottom" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              replay();
            }}
            className="flex-shrink-0 p-1.5 active:scale-90 transition-transform animate-gentle-bounce"
            aria-label="Replay audio"
          >
            <Image
              src="/icons/icon-sound-on.webp"
              alt="Replay"
              width={36}
              height={36}
              className="object-contain drop-shadow-md"
            />
          </button>
        </div>
      </div>

      {/* Continue button */}
      <button
        onClick={onContinue}
        className="mt-8 btn-3d btn-3d-purple p-5 animate-tap-hint"
        aria-label="Continue"
      >
        <Image
          src="/icons/icon-next.webp"
          alt=""
          width={44}
          height={44}
          className="object-contain"
        />
      </button>
    </div>
  );
}
