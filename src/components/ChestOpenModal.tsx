"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import Confetti from "@/components/Confetti";
import MiniBoardPreview from "@/components/MiniBoardPreview";
import PieceColorPreview from "@/components/PieceColorPreview";
import { BOARD_THEMES, PIECE_COLOR_SETS } from "@/data/themes";
import { useAudio } from "@/hooks/useAudio";
import type { ChestDefinition, Reward } from "@/types/lesson";

interface ChestOpenModalProps {
  chest: ChestDefinition;
  onClose: () => void;
}

/** Sparkle particles that burst from the chest */
const SPARKLES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const distance = 50 + (i % 3) * 20;
  return {
    id: i,
    tx: Math.cos(angle) * distance,
    ty: Math.sin(angle) * distance - 20,
    delay: (i % 4) * 0.05,
    size: 5 + (i % 3) * 2,
  };
});

function ChestOpenSVG({ phase }: { phase: number }) {
  const bodyColor = "#FCD34D";
  const lidColor = "#F59E0B";
  const claspColor = "#FDE68A";

  return (
    <svg width={120} height={110} viewBox="0 0 40 36" style={{ overflow: "visible" }}>
      {/* Body */}
      <rect x="2" y="16" width="36" height="18" rx="4" fill={bodyColor} stroke={lidColor} strokeWidth="2.5" />
      {/* Lid — separate group for animation */}
      <g
        style={{
          transformOrigin: "20px 18px",
          transform: phase >= 2 ? "rotateX(-110deg)" : "rotateX(0deg)",
          transition: "transform 0.8s ease-out",
        }}
      >
        <path
          d="M 2 18 Q 2 6, 20 4 Q 38 6, 38 18"
          fill={lidColor}
          stroke={lidColor}
          strokeWidth="1.5"
        />
      </g>
      {/* Clasp */}
      <rect x="14" y="13" width="12" height="9" rx="3" fill={claspColor} stroke={bodyColor} strokeWidth="2" />
      {/* Keyhole */}
      <circle cx="20" cy="17.5" r="2.2" fill="#92400e" />
    </svg>
  );
}

function RewardCard({ reward }: { reward: Reward }) {
  const theme = BOARD_THEMES.find((t) => t.id === reward.themeId);
  const colorSet = PIECE_COLOR_SETS.find((p) => p.id === reward.pieceColorId);

  if (reward.type === "board-theme" && theme) {
    return (
      <div className="flex flex-col items-center gap-2">
        <MiniBoardPreview theme={theme} size="md" />
        <span className="text-sm font-bold" style={{ color: "var(--ck-text-light)" }}>
          {theme.name}
        </span>
      </div>
    );
  }

  if (reward.type === "piece-color" && colorSet) {
    return (
      <div className="flex flex-col items-center gap-2">
        <PieceColorPreview colorSet={colorSet} size={48} />
        <span className="text-sm font-bold" style={{ color: "var(--ck-text-light)" }}>
          {colorSet.name}
        </span>
      </div>
    );
  }

  return null;
}

export default function ChestOpenModal({ chest, onClose }: ChestOpenModalProps) {
  const [phase, setPhase] = useState(1);
  const { sfx } = useAudio();

  // Phase transitions
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 1 → 2: chest opens
    timers.push(setTimeout(() => {
      setPhase(2);
      sfx("chest-open");
    }, 1000));

    // Phase 2 → 3: reward reveals
    timers.push(setTimeout(() => {
      setPhase(3);
      sfx("confetti");
    }, 2500));

    // Phase 3 → 4: equipped
    timers.push(setTimeout(() => {
      setPhase(4);
    }, 3300));

    return () => timers.forEach(clearTimeout);
  }, [sfx]);

  // Memoize sparkle styles
  const sparkleElements = useMemo(
    () =>
      SPARKLES.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full animate-sparkle-fly"
          style={{
            "--tx": `${s.tx}px`,
            "--ty": `${s.ty}px`,
            width: s.size,
            height: s.size,
            background: s.id % 2 === 0 ? "#FCD34D" : "#FDE68A",
            animationDelay: `${s.delay}s`,
            left: "50%",
            top: "50%",
            marginLeft: -s.size / 2,
            marginTop: -s.size / 2,
          } as React.CSSProperties}
        />
      )),
    []
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Dark overlay — fades in */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: "rgba(0,0,0,0.65)" }}
        onClick={phase >= 4 ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Confetti for phase 3+ */}
      <Confetti active={phase >= 3} particleCount={80} />

      {/* Center content */}
      <div className="relative z-50 flex flex-col items-center">
        {/* Chest */}
        <div className={`relative ${phase === 1 ? "animate-chest-bounce-in" : ""}`}>
          {/* Light burst behind chest */}
          {phase >= 2 && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ top: "-20px" }}
            >
              <div
                className="w-32 h-32 rounded-full animate-light-burst"
                style={{
                  background: "radial-gradient(circle, rgba(252,211,77,0.8) 0%, rgba(252,211,77,0.3) 40%, transparent 70%)",
                }}
              />
            </div>
          )}

          {/* Sparkle particles */}
          {phase >= 2 && phase < 4 && (
            <div className="absolute inset-0 pointer-events-none">
              {sparkleElements}
            </div>
          )}

          {/* Chest glow */}
          {phase === 1 && (
            <div
              className="absolute -inset-6 rounded-full animate-pulse"
              style={{ background: "rgba(252, 211, 77, 0.3)" }}
            />
          )}

          <div className={phase === 1 ? "animate-chest-shake" : ""}>
            <ChestOpenSVG phase={phase} />
          </div>
        </div>

        {/* Reward card — rises from behind chest */}
        {phase >= 3 && (
          <div
            className="mt-4 animate-reward-rise rounded-2xl p-5 flex flex-col items-center gap-4"
            style={{
              background: "white",
              border: "3px solid var(--ck-gold)",
              boxShadow: "0 0 24px rgba(252, 211, 77, 0.4), 0 8px 32px rgba(0,0,0,0.15)",
              minWidth: 200,
            }}
          >
            {chest.rewards.map((reward) => (
              <RewardCard key={reward.id} reward={reward} />
            ))}

            {/* Equipped checkmark */}
            {phase >= 4 && (
              <div className="animate-celebrate-pop flex items-center gap-1.5">
                <CheckCircle size={28} weight="fill" color="var(--ck-mint-dark)" />
              </div>
            )}
          </div>
        )}

        {/* Close button — appears in phase 4 */}
        {phase >= 4 && (
          <button
            onClick={onClose}
            className="mt-5 btn-3d btn-3d-gold animate-slide-in"
          >
            <span className="text-lg">&#10003;</span>
          </button>
        )}
      </div>
    </div>
  );
}
