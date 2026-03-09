"use client";

import { Star } from "@phosphor-icons/react";
import type { Lesson } from "@/types/lesson";

const ICON_MAP: Record<Lesson["icon"], string> = {
  board: "\u2b1b",
  pawn: "\u265f",
  knight: "\u265e",
  bishop: "\u265d",
  rook: "\u265c",
  queen: "\u265b",
  king: "\u265a",
  special: "\u2728",
  tactics: "\u2694\ufe0f",
};

type LessonStatus = "completed" | "current" | "locked";

interface LessonStopProps {
  lesson: Lesson;
  status: LessonStatus;
  stars: number;
  x: number;
  y: number;
  onTap: () => void;
}

export default function LessonStop({
  lesson,
  status,
  stars,
  x,
  y,
  onTap,
}: LessonStopProps) {
  const emoji = ICON_MAP[lesson.icon] || "\u2b1b";

  const bgClass =
    status === "completed"
      ? "bg-green-500"
      : status === "current"
        ? "bg-amber-400 animate-pulse-glow"
        : "bg-gray-400";

  return (
    <button
      className={`absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 ${
        status === "locked" ? "opacity-30 cursor-default" : "cursor-pointer"
      }`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={status !== "locked" ? onTap : undefined}
      disabled={status === "locked"}
      aria-label={`Lesson: ${lesson.id}${status === "locked" ? " (locked)" : ""}`}
    >
      <div
        className={`w-14 h-14 rounded-full ${bgClass} flex items-center justify-center text-2xl shadow-lg border-2 border-white/60`}
      >
        {emoji}
      </div>

      {status === "completed" && (
        <div className="flex gap-0.5 mt-1">
          {Array.from({ length: 3 }, (_, i) => (
            <Star
              key={i}
              size={14}
              weight={i < stars ? "fill" : "regular"}
              className={i < stars ? "text-yellow-400" : "text-gray-300"}
            />
          ))}
        </div>
      )}
    </button>
  );
}
