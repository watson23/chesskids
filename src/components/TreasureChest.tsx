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
  onTap,
  onLockedTap,
}: TreasureChestProps) {
  const [shaking, setShaking] = useState(false);

  const handleLockedTap = useCallback(() => {
    if (shaking) return;
    setShaking(true);
    onLockedTap?.();
    setTimeout(() => setShaking(false), 400);
  }, [shaking, onLockedTap]);

  return (
    <button
      className={`absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 journey-node ${
        status === "unlocked"
          ? "cursor-pointer animate-chest-shake"
          : status === "locked"
            ? "opacity-60 cursor-default"
            : "cursor-default"
      } ${shaking ? "animate-chest-shake" : ""}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={status === "unlocked" ? onTap : status === "locked" ? handleLockedTap : undefined}
      aria-disabled={status === "locked"}
      aria-label={`Treasure chest (${status})`}
    >
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
    </button>
  );
}
