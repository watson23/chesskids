"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Lock, CaretRight } from "@phosphor-icons/react";
import { useAudio } from "@/hooks/useAudio";
import { useLocale } from "@/hooks/useLocale";
import Pikku from "@/components/Pikku";
import SpeechBubble from "@/components/SpeechBubble";

const STAGGER_CLASSES = [
  "animate-fade-in-up",
  "animate-fade-in-up-d1",
  "animate-fade-in-up-d2",
  "animate-fade-in-up-d3",
];

interface Opponent {
  level: 1 | 2 | 3 | 4;
  nameKey: string;
  taglineKey: string;
  image: string;
  stars: number;
  bgColor: string;
  accentColor: string;
  locked?: boolean;
}

const OPPONENTS: Opponent[] = [
  {
    level: 1,
    nameKey: "opponent_mouse_name",
    taglineKey: "opponent_mouse_tagline",
    image: "/opponents/mouse.webp",
    stars: 1,
    bgColor: "#D1FAE5",
    accentColor: "#6EE7B7",
  },
  {
    level: 2,
    nameKey: "opponent_fox_name",
    taglineKey: "opponent_fox_tagline",
    image: "/opponents/fox.webp",
    stars: 2,
    bgColor: "#FEF3C7",
    accentColor: "#FCD34D",
  },
  {
    level: 3,
    nameKey: "opponent_owl_name",
    taglineKey: "opponent_owl_tagline",
    image: "/opponents/owl.webp",
    stars: 3,
    bgColor: "#DBEAFE",
    accentColor: "#93C5FD",
  },
  {
    level: 4,
    nameKey: "opponent_bear_name",
    taglineKey: "opponent_bear_tagline",
    image: "/opponents/bear.webp",
    stars: 4,
    bgColor: "#FCE7F3",
    accentColor: "#FDA4AF",
    locked: true,
  },
];

export default function PlayPage() {
  const router = useRouter();
  const { sfx } = useAudio();
  const { t } = useLocale();
  const [owlBeaten, setOwlBeaten] = useState(false);
  const [wiggleId, setWiggleId] = useState<number | null>(null);

  useEffect(() => {
    const beaten = localStorage.getItem("chesspenguin_owl_beaten") === "true";
    setOwlBeaten(beaten);
  }, []);

  const handleOpponentTap = useCallback(
    (opponent: Opponent) => {
      const isLocked = opponent.locked && !owlBeaten;
      if (isLocked) {
        sfx("button-tap");
        setWiggleId(opponent.level);
        setTimeout(() => setWiggleId(null), 600);
        return;
      }
      sfx("button-tap");
      router.push(`/play/game?level=${opponent.level}`);
    },
    [router, sfx, owlBeaten]
  );

  return (
    <div
      className="min-h-dvh flex flex-col pb-24 overflow-y-auto"
      style={{
        background: "var(--ck-bg) url(/play-bg.webp) center top / cover no-repeat fixed",
      }}
    >
      {/* Semi-transparent overlay */}
      <div
        className="min-h-dvh flex flex-col"
        style={{ background: "rgba(245, 240, 255, 0.55)" }}
      >
        {/* Pikku header */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-2 animate-fade-in-up">
          <Pikku expression="wink" size={72} />
          <SpeechBubble text={t("play_pikku_speech")} visible />
        </div>

        {/* Opponent cards */}
        <div className="flex-1 px-4 py-4 flex flex-col items-center gap-4">
          {OPPONENTS.map((opponent, index) => {
            const isLocked = opponent.locked && !owlBeaten;
            const isWiggling = wiggleId === opponent.level;

            return (
              <button
                key={opponent.level}
                onClick={() => handleOpponentTap(opponent)}
                className={`card-pillow w-full max-w-sm flex items-center gap-4 px-4 py-3 transition-transform ${STAGGER_CLASSES[index] || "animate-fade-in-up"} ${isWiggling ? "animate-wiggle-locked" : ""}`}
                style={{
                  transform: "translateY(0)",
                  opacity: isLocked ? 0.7 : 1,
                }}
                onPointerDown={(e) => {
                  if (!isLocked) {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(3px) scale(0.98)";
                  }
                }}
                onPointerUp={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
                onPointerLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
                aria-label={isLocked ? t("opponent_locked") : `${t(opponent.nameKey)}, level ${opponent.level}`}
              >
                {/* Animal portrait */}
                <div
                  className="relative w-[72px] h-[72px] rounded-2xl flex-shrink-0 overflow-hidden"
                  style={{ background: opponent.bgColor }}
                >
                  <Image
                    src={opponent.image}
                    alt={t(opponent.nameKey)}
                    width={72}
                    height={72}
                    className="object-cover"
                    style={isLocked ? { filter: "grayscale(0.6) blur(1px)" } : undefined}
                  />
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl" style={{ background: "rgba(0,0,0,0.25)" }}>
                      <Lock size={28} weight="fill" color="white" />
                    </div>
                  )}
                </div>

                {/* Name, tagline, stars */}
                <div className="flex-1 flex flex-col items-start gap-0.5 min-w-0">
                  <span
                    className="text-[16px] font-extrabold leading-tight"
                    style={{ color: isLocked ? "var(--ck-text-light)" : "var(--ck-text)" }}
                  >
                    {isLocked ? "???" : t(opponent.nameKey)}
                  </span>
                  <span
                    className="text-[13px] font-semibold leading-tight"
                    style={{ color: "var(--ck-text-light)" }}
                  >
                    {isLocked ? t("opponent_locked") : t(opponent.taglineKey)}
                  </span>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: opponent.stars }, (_, i) => (
                      <Star
                        key={i}
                        size={16}
                        weight="fill"
                        color={isLocked ? "#CBD5E1" : opponent.accentColor}
                      />
                    ))}
                  </div>
                </div>

                {/* Play arrow or lock */}
                <div className="flex-shrink-0">
                  {isLocked ? (
                    <Lock size={24} weight="bold" color="var(--ck-text-light)" />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: opponent.accentColor }}
                    >
                      <CaretRight size={22} weight="bold" color="white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
