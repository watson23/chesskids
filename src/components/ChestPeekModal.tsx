"use client";

import { useEffect } from "react";
import { Star } from "@phosphor-icons/react";
import MiniBoardPreview from "@/components/MiniBoardPreview";
import PieceColorPreview from "@/components/PieceColorPreview";
import { BOARD_THEMES, PIECE_COLOR_SETS } from "@/data/themes";
import type { ChestDefinition, Reward } from "@/types/lesson";

interface ChestPeekModalProps {
  chest: ChestDefinition;
  totalStars: number;
  onClose: () => void;
}

function BlurredRewardCard({ reward }: { reward: Reward }) {
  const theme = BOARD_THEMES.find((t) => t.id === reward.themeId);
  const colorSet = PIECE_COLOR_SETS.find((p) => p.id === reward.pieceColorId);

  if (reward.type === "board-theme" && theme) {
    return (
      <div
        className="flex flex-col items-center gap-2"
        style={{ filter: "blur(8px) saturate(0) brightness(0.7)" }}
      >
        <MiniBoardPreview theme={theme} size="md" />
        <span className="text-sm font-bold" style={{ color: "var(--ck-text-light)" }}>
          {theme.name}
        </span>
      </div>
    );
  }

  if (reward.type === "piece-color" && colorSet) {
    return (
      <div
        className="flex flex-col items-center gap-2"
        style={{ filter: "blur(8px) saturate(0) brightness(0.7)" }}
      >
        <PieceColorPreview colorSet={colorSet} size={48} />
        <span className="text-sm font-bold" style={{ color: "var(--ck-text-light)" }}>
          {colorSet.name}
        </span>
      </div>
    );
  }

  return null;
}

export default function ChestPeekModal({ chest, totalStars, onClose }: ChestPeekModalProps) {
  const starsNeeded = chest.starsRequired - totalStars;

  // Auto-dismiss after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: "rgba(0,0,0,0.5)" }}
        aria-hidden="true"
      />

      {/* Peek card */}
      <div className="relative z-50 flex flex-col items-center gap-4 animate-slide-in">
        {/* Chest SVG */}
        <svg width={80} height={72} viewBox="0 0 40 36">
          <rect x="2" y="16" width="36" height="18" rx="4" fill="#C4C0D0" stroke="#A8A4B8" strokeWidth="2.5" />
          <path d="M 2 18 Q 2 6, 20 4 Q 38 6, 38 18" fill="#A8A4B8" stroke="#A8A4B8" strokeWidth="1.5" />
          <rect x="14" y="13" width="12" height="9" rx="3" fill="#D4D0E0" stroke="#C4C0D0" strokeWidth="2" />
          <circle cx="20" cy="17.5" r="2.2" fill="#C4C0D0" />
        </svg>

        {/* Blurred reward previews */}
        <div
          className="rounded-2xl p-5 flex flex-col items-center gap-4"
          style={{
            background: "white",
            border: "3px solid var(--ck-border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            minWidth: 200,
          }}
        >
          {chest.rewards.map((reward) => (
            <BlurredRewardCard key={reward.id} reward={reward} />
          ))}

          {/* Star requirement badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: "var(--ck-pink)",
              color: "white",
            }}
          >
            <Star size={16} weight="fill" />
            <span className="text-sm font-extrabold">
              {starsNeeded > 0 ? `${starsNeeded} more needed` : "Ready!"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
