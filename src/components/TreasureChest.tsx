"use client";

import type { ChestDefinition } from "@/types/lesson";

type ChestStatus = "locked" | "unlocked" | "opened";

interface TreasureChestProps {
  chest: ChestDefinition;
  status: ChestStatus;
  x: number;
  y: number;
  onTap: () => void;
}

export default function TreasureChest({
  chest,
  status,
  x,
  y,
  onTap,
}: TreasureChestProps) {
  const emoji = status === "locked" ? "\ud83d\udce6" : status === "unlocked" ? "\ud83c\udf81" : "\ud83d\udced";

  return (
    <button
      className={`absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 ${
        status === "unlocked"
          ? "cursor-pointer animate-chest-shake"
          : status === "locked"
            ? "opacity-50 cursor-default"
            : "cursor-default"
      }`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={status === "unlocked" ? onTap : undefined}
      disabled={status !== "unlocked"}
      aria-label={`Treasure chest: ${chest.starsRequired} stars required (${status})`}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-[10px] font-bold text-amber-800 mt-0.5">
        {chest.starsRequired}{"\u2b50"}
      </span>
    </button>
  );
}
