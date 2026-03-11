"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Confetti from "@/components/Confetti";
import SpeechBubble from "@/components/SpeechBubble";
import StarDisplay from "@/components/StarDisplay";
import Piku from "@/components/Piku";
import { useAudio } from "@/hooks/useAudio";
import { useLocale } from "@/hooks/useLocale";

interface FinalCelebrationProps {
  stars: number;
  onContinue: () => void;
}

export default function FinalCelebration({ stars, onContinue }: FinalCelebrationProps) {
  const [phase, setPhase] = useState(1);
  const { sfx } = useAudio();
  const { t } = useLocale();

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 1: main celebration message + confetti
    timers.push(setTimeout(() => sfx("confetti"), 100));

    // Phase 2: champion reward message
    timers.push(setTimeout(() => {
      setPhase(2);
      sfx("chest-open");
    }, 2000));

    // Phase 3: more coming message with winking Piku
    timers.push(setTimeout(() => {
      setPhase(3);
    }, 3500));

    return () => timers.forEach(clearTimeout);
  }, [sfx]);

  return (
    <div className="flex flex-col items-center gap-5 animate-slide-in mt-auto mb-auto py-6">
      <Confetti active particleCount={120} />

      {/* Main celebration message */}
      <SpeechBubble
        text={t("celebrate_all_complete")}
        visible
        pointer="bottom"
      />

      {/* Large celebrating Piku */}
      <Piku expression="standing-celebrating" size={200} />

      {/* Stars */}
      <StarDisplay stars={stars} size={56} staggerDelay={300} />

      {/* Champion reward message — phase 2+ */}
      {phase >= 2 && (
        <div className="animate-slide-in text-center px-4">
          <p
            className="text-lg font-bold"
            style={{
              color: "var(--ck-gold-dark)",
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            {t("celebrate_champion_reward")}
          </p>
        </div>
      )}

      {/* More coming message — phase 3 */}
      {phase >= 3 && (
        <div className="animate-slide-in flex flex-col items-center gap-2">
          <Piku expression="standing-winking" size={80} />
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--ck-text-light)" }}
          >
            {t("celebrate_more_coming")}
          </p>
        </div>
      )}

      {/* Continue button */}
      <button
        onClick={onContinue}
        className="btn-3d btn-3d-purple mt-4 flex items-center gap-3 text-lg px-8 py-3"
      >
        {t("continue")}
        <Image src="/icons/icon-next.webp" alt="" width={26} height={26} className="object-contain" />
      </button>
    </div>
  );
}
