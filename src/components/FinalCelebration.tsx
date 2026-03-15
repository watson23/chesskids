"use client";

import { useEffect } from "react";
import Image from "next/image";
import Confetti from "@/components/Confetti";
import SpeechBubble from "@/components/SpeechBubble";
import StarDisplay from "@/components/StarDisplay";
import PikuWithOutfit from "@/components/PikuWithOutfit";
import { useAudio } from "@/hooks/useAudio";
import { useLocale } from "@/hooks/useLocale";

interface FinalCelebrationProps {
  stars: number;
  onContinue: () => void;
  equippedOutfit?: { head?: string; body?: string };
}

export default function FinalCelebration({ stars, onContinue, equippedOutfit }: FinalCelebrationProps) {
  const { sfx } = useAudio();
  const { t } = useLocale();

  useEffect(() => {
    const timer = setTimeout(() => sfx("confetti"), 100);
    return () => clearTimeout(timer);
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
      <PikuWithOutfit expression="standing-celebrating" headImage={equippedOutfit?.head} bodyImage={equippedOutfit?.body} size={200} />

      {/* Stars */}
      <StarDisplay stars={stars} size={56} staggerDelay={300} />

      {/* More adventures coming */}
      <p
        className="text-sm font-semibold animate-slide-in"
        style={{ color: "var(--ck-text-light)" }}
      >
        {t("celebrate_more_coming")}
      </p>

      {/* Continue button */}
      <button onClick={onContinue} className="mt-4 animate-bounce-gentle p-2 active:scale-90 transition-transform">
        <Image src="/icons/icon-check-circle.webp" alt={t("continue")} width={64} height={64} className="object-contain drop-shadow-lg" />
      </button>
    </div>
  );
}
