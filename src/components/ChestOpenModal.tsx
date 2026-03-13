"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Confetti from "@/components/Confetti";
import PikuWithOutfit from "@/components/PikuWithOutfit";
import { getOutfitItem } from "@/data/outfits";
import { useAudio } from "@/hooks/useAudio";
import { useLocale } from "@/hooks/useLocale";
import type { ChestDefinition } from "@/types/lesson";

interface ChestOpenModalProps {
  chest: ChestDefinition;
  onClose: () => void;
}

/** Sparkle particles that burst from the chest */
type SparkleShape = "circle" | "star" | "diamond";
const SPARKLE_SHAPES: SparkleShape[] = ["circle", "star", "diamond", "circle", "star", "circle", "diamond", "star", "circle", "star", "diamond", "circle"];

const SPARKLES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const distance = 60 + (i % 3) * 25;
  return {
    id: i,
    tx: Math.cos(angle) * distance,
    ty: Math.sin(angle) * distance - 20,
    delay: (i % 4) * 0.05,
    size: 6 + (i % 3) * 3,
    shape: SPARKLE_SHAPES[i],
  };
});

export default function ChestOpenModal({ chest, onClose }: ChestOpenModalProps) {
  // Phases: 1=chest bounces in, 2=chest opens+sparkles, 3=show reward item, 4=pikku reveal+done
  const [phase, setPhase] = useState(1);
  const [currentRewardIdx, setCurrentRewardIdx] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pikkyRevealed, setPikkyRevealed] = useState(false);
  const { sfx } = useAudio();
  const { t } = useLocale();

  const outfitRewards = chest.rewards
    .filter((r) => r.type === "outfit" && r.outfitId)
    .map((r) => {
      const outfit = getOutfitItem(r.outfitId!);
      return outfit ? { reward: r, outfit } : null;
    })
    .filter(Boolean) as { reward: typeof chest.rewards[0]; outfit: NonNullable<ReturnType<typeof getOutfitItem>> }[];

  const totalRewards = outfitRewards.length;
  const currentOutfit = outfitRewards[currentRewardIdx] ?? null;
  const isLastReward = currentRewardIdx >= totalRewards - 1;

  // Phase auto-transitions
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 1 → 2: chest opens after bounce
    timers.push(setTimeout(() => {
      setPhase(2);
      sfx("chest-open");
    }, 1000));

    // Phase 2 → 3: first reward rises
    timers.push(setTimeout(() => {
      setPhase(3);
      setShowConfetti(true);
      sfx("confetti");
    }, 2200));

    return () => timers.forEach(clearTimeout);
  }, [sfx]);

  // Handle tap to advance rewards or reveal Pikku
  const handleTap = useCallback(() => {
    if (phase < 3) return; // not ready yet

    if (pikkyRevealed) {
      onClose();
      return;
    }

    if (isLastReward) {
      // Show Pikku with the last outfit
      setPikkyRevealed(true);
      sfx("confetti");
      setShowConfetti(true);
    } else {
      // Next reward
      setCurrentRewardIdx((prev) => prev + 1);
      setShowConfetti(false);
      setTimeout(() => {
        setShowConfetti(true);
        sfx("confetti");
      }, 100);
    }
  }, [phase, pikkyRevealed, isLastReward, onClose, sfx]);

  // Collect all head/body images from chest rewards for PikuWithOutfit
  const pikuHead = outfitRewards.find((r) => r.outfit.slot === "head")?.outfit.image;
  const pikuBody = outfitRewards.find((r) => r.outfit.slot === "body")?.outfit.image;

  // Memoize sparkle elements
  const sparkleElements = useMemo(
    () =>
      SPARKLES.map((s) => {
        const color = s.id % 2 === 0 ? "#FCD34D" : "#FDE68A";
        const base = {
          "--tx": `${s.tx}px`,
          "--ty": `${s.ty}px`,
          animationDelay: `${s.delay}s`,
          left: "50%",
          top: "50%",
        } as React.CSSProperties;

        if (s.shape === "star") {
          return (
            <svg
              key={s.id}
              className="absolute animate-sparkle-fly"
              width={s.size * 2}
              height={s.size * 2}
              viewBox="0 0 20 20"
              style={{ ...base, marginLeft: -s.size, marginTop: -s.size }}
            >
              <path d="M10 0 L12.5 7 L20 8 L14 13 L15.5 20 L10 16 L4.5 20 L6 13 L0 8 L7.5 7 Z" fill={color} />
            </svg>
          );
        }

        if (s.shape === "diamond") {
          return (
            <div
              key={s.id}
              className="absolute animate-sparkle-fly"
              style={{
                ...base,
                width: s.size,
                height: s.size,
                background: color,
                transform: "rotate(45deg)",
                marginLeft: -s.size / 2,
                marginTop: -s.size / 2,
              }}
            />
          );
        }

        return (
          <div
            key={s.id}
            className="absolute rounded-full animate-sparkle-fly"
            style={{
              ...base,
              width: s.size,
              height: s.size,
              background: color,
              marginLeft: -s.size / 2,
              marginTop: -s.size / 2,
            }}
          />
        );
      }),
    []
  );

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center" onClick={phase >= 3 ? handleTap : undefined}>
      {/* Celebration background */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          backgroundImage: "url(/bg-chest-celebration.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />
      {/* Slight dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />

      {/* Confetti */}
      <Confetti active={showConfetti} particleCount={80} />

      {/* Center content */}
      <div className="relative z-50 flex flex-col items-center">
        {/* Chest image */}
        {!pikkyRevealed && (
          <div className={`relative ${phase === 1 ? "animate-chest-bounce-in" : ""}`}>
            {/* Light burst */}
            {phase >= 2 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: "-20px" }}>
                <div
                  className="w-40 h-40 rounded-full animate-light-burst"
                  style={{
                    background: "radial-gradient(circle, rgba(252,211,77,0.8) 0%, rgba(252,211,77,0.3) 40%, transparent 70%)",
                  }}
                />
              </div>
            )}

            {/* Sparkles */}
            {phase >= 2 && !pikkyRevealed && (
              <div className="absolute inset-0 pointer-events-none">
                {sparkleElements}
              </div>
            )}

            {/* Glow pulse before opening */}
            {phase === 1 && (
              <div
                className="absolute -inset-8 rounded-full animate-pulse"
                style={{ background: "rgba(252, 211, 77, 0.3)" }}
              />
            )}

            <div className={phase === 1 ? "animate-chest-shake" : ""}>
              <Image
                src={phase >= 2 ? "/icons/icon-chest-open-left-side.webp" : "/icons/icon-chest-closed-left-side.webp"}
                alt="Treasure chest"
                width={160}
                height={160}
                style={{ width: 160, height: "auto" }}
                priority
              />
            </div>
          </div>
        )}

        {/* Reward item display */}
        {phase >= 3 && !pikkyRevealed && currentOutfit && (
          <div className="animate-reward-rise flex flex-col items-center" key={`reward-${currentRewardIdx}`}>
            {/* Golden glow behind item */}
            <div
              className="absolute rounded-full"
              style={{
                width: 140,
                height: 140,
                background: "radial-gradient(circle, rgba(252,211,77,0.5) 0%, rgba(252,211,77,0.15) 50%, transparent 70%)",
                top: -20,
              }}
            />
            <div className="relative">
              <Image
                src={currentOutfit.outfit.iconImage ?? currentOutfit.outfit.image}
                alt="New reward"
                width={120}
                height={120}
                style={{ width: 120, height: "auto", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}
              />
            </div>

            {/* Tap indicator — bouncing hand icon + text */}
            <div className="mt-8 flex flex-col items-center animate-bounce-gentle">
              <span className="text-3xl" role="img" aria-label="tap">👆</span>
              <span className="text-white text-sm font-bold mt-1 drop-shadow-md">
                {t("tap_hint")}
              </span>
            </div>
          </div>
        )}

        {/* Pikku reveal — slides up from bottom */}
        {pikkyRevealed && (
          <div className="animate-reward-rise flex flex-col items-center">
            <PikuWithOutfit
              expression="standing-celebrating"
              headImage={pikuHead}
              bodyImage={pikuBody}
              size={200}
            />

            {/* Close button — illustrated checkmark */}
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="mt-6 animate-celebrate-pop"
            >
              <Image
                src="/icons/icon-check-circle.webp"
                alt="Done"
                width={56}
                height={56}
                style={{ width: 56, height: "auto", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))" }}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
