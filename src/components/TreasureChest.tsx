"use client";

import { useState, useCallback } from "react";
import type { ChestDefinition } from "@/types/lesson";

type ChestStatus = "locked" | "unlocked" | "opened";

interface TreasureChestProps {
  chest: ChestDefinition;
  status: ChestStatus;
  x: number;
  y: number;
  totalStars?: number;
  onTap: () => void;
  onLockedTap?: () => void;
}

function ChestSVG({ status }: { status: ChestStatus }) {
  const bodyColor = status === "opened" ? "#C9A8E8" : status === "unlocked" ? "#FCD34D" : "#C4C0D0";
  const lidColor = status === "opened" ? "#B197FC" : status === "unlocked" ? "#F59E0B" : "#A8A4B8";
  const claspColor = status === "unlocked" ? "#FDE68A" : "#D4D0E0";

  return (
    <svg width={56} height={50} viewBox="0 0 40 36">
      {/* Body */}
      <rect x="2" y="16" width="36" height="18" rx="4" fill={bodyColor} stroke={lidColor} strokeWidth="2.5" />
      {/* Lid */}
      <path
        d={status === "opened"
          ? "M 2 16 Q 2 4, 20 6 Q 38 4, 38 16"
          : "M 2 18 Q 2 6, 20 4 Q 38 6, 38 18"
        }
        fill={lidColor}
        stroke={lidColor}
        strokeWidth="1.5"
      />
      {/* Clasp */}
      <rect x="14" y="13" width="12" height="9" rx="3" fill={claspColor} stroke={bodyColor} strokeWidth="2" />
      {/* Keyhole */}
      <circle cx="20" cy="17.5" r="2.2" fill={status === "unlocked" ? "#92400e" : bodyColor} />
      {status === "opened" && (
        <>
          {/* Sparkles */}
          <circle cx="12" cy="6" r="2" fill="#FCD34D" opacity="0.9" />
          <circle cx="28" cy="4" r="1.5" fill="#FCD34D" opacity="0.7" />
          <circle cx="20" cy="2" r="1.2" fill="#FDE68A" opacity="0.8" />
          <circle cx="8" cy="3" r="1" fill="#B197FC" opacity="0.6" />
          <circle cx="32" cy="7" r="1" fill="#FDA4AF" opacity="0.6" />
        </>
      )}
    </svg>
  );
}

export default function TreasureChest({
  chest,
  status,
  x,
  y,
  totalStars = 0,
  onTap,
  onLockedTap,
}: TreasureChestProps) {
  const [shaking, setShaking] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleLockedTap = useCallback(() => {
    if (shaking) return;
    setShaking(true);
    setShowTooltip(true);
    onLockedTap?.();
    setTimeout(() => setShaking(false), 400);
    setTimeout(() => setShowTooltip(false), 2000);
  }, [shaking, onLockedTap]);

  const starsNeeded = chest.starsRequired - totalStars;

  return (
    <button
      className={`absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 ${
        status === "unlocked"
          ? "cursor-pointer animate-chest-shake"
          : status === "locked"
            ? "opacity-50 cursor-default"
            : "cursor-default"
      } ${shaking ? "animate-chest-shake" : ""}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={status === "unlocked" ? onTap : status === "locked" ? handleLockedTap : undefined}
      aria-disabled={status === "locked"}
      aria-label={`Treasure chest: ${chest.starsRequired} stars required (${status})`}
    >
      {/* "X more" tooltip for locked chests */}
      {showTooltip && starsNeeded > 0 && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap animate-slide-in z-10 px-2.5 py-1 rounded-full text-[11px] font-extrabold"
          style={{
            background: "var(--ck-pink)",
            color: "white",
            boxShadow: "0 2px 8px rgba(244, 114, 182, 0.4)",
          }}
        >
          {starsNeeded} more {"\u2b50"}
        </div>
      )}

      {/* Glow behind unlocked chests */}
      {status === "unlocked" && (
        <div
          className="absolute -inset-4 rounded-full animate-pulse"
          style={{ background: "rgba(252, 211, 77, 0.3)" }}
        />
      )}
      <div className="relative">
        <ChestSVG status={status} />
      </div>
      <span
        className="text-[11px] font-extrabold mt-1 px-2 py-0.5 rounded-full"
        style={{
          background: status === "unlocked" ? "rgba(252, 211, 77, 0.3)" : "rgba(177, 151, 252, 0.15)",
          color: status === "unlocked" ? "#92400e" : "var(--ck-text-light)",
        }}
      >
        {chest.starsRequired}{"\u2b50"}
      </span>
    </button>
  );
}
