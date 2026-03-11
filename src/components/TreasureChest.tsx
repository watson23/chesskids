"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
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

/** Pick the correct chest image based on open/closed and left/right side of the path */
function getChestImage(status: ChestStatus, x: number): string {
  const side = x < 50 ? "left" : "right";
  const state = status === "opened" ? "open" : "closed";
  return `/icons/icon-chest-${state}-${side}-side.webp`;
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
      className={`absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 journey-node ${
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
        <Image
          src={getChestImage(status, x)}
          alt={`Treasure chest (${status})`}
          width={80}
          height={80}
          className="object-contain drop-shadow-md"
          style={{ width: 80, height: "auto" }}
        />
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
