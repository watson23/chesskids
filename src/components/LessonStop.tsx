"use client";

import { type ReactNode, useState, useCallback } from "react";
import Image from "next/image";
import type { Lesson } from "@/types/lesson";
import {
  PawnSVG,
  KnightSVG,
  BishopSVG,
  RookSVG,
  QueenSVG,
  KingSVG,
} from "@/lib/pieces";

type LessonStatus = "completed" | "current" | "locked";

interface LessonStopProps {
  lesson: Lesson;
  index: number;
  status: LessonStatus;
  stars: number;
  x: number;
  y: number;
  onTap: () => void;
  sparkle?: boolean;
  unlocking?: boolean;
  justUnlocked?: boolean;
  onLockedTap?: () => void;
}

function BoardIcon() {
  return (
    <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="9" height="9" rx="1.5" fill="white" opacity="0.95" />
      <rect x="13" y="2" width="9" height="9" rx="1.5" fill="white" opacity="0.45" />
      <rect x="2" y="13" width="9" height="9" rx="1.5" fill="white" opacity="0.45" />
      <rect x="13" y="13" width="9" height="9" rx="1.5" fill="white" opacity="0.95" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width={26} height={26} viewBox="0 0 24 24" fill="white">
      <path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z" opacity="0.95" />
      <path d="M18 14 L18.8 16.2 L21 17 L18.8 17.8 L18 20 L17.2 17.8 L15 17 L17.2 16.2 Z" opacity="0.7" />
    </svg>
  );
}

function TacticsIcon() {
  return (
    <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="8" opacity="0.7" />
      <circle cx="12" cy="12" r="3" opacity="0.95" />
      <line x1="12" y1="2" x2="12" y2="6" opacity="0.7" />
      <line x1="12" y1="18" x2="12" y2="22" opacity="0.7" />
      <line x1="2" y1="12" x2="6" y2="12" opacity="0.7" />
      <line x1="18" y1="12" x2="22" y2="12" opacity="0.7" />
    </svg>
  );
}

const PIECE_COMPONENTS: Record<string, (props: { fill: string; stroke: string; size: number }) => ReactNode> = {
  pawn: PawnSVG,
  knight: KnightSVG,
  bishop: BishopSVG,
  rook: RookSVG,
  queen: QueenSVG,
  king: KingSVG,
};

function LessonIcon({ icon }: { icon: Lesson["icon"] }) {
  const PieceSVG = PIECE_COMPONENTS[icon];
  if (PieceSVG) {
    return <PieceSVG fill="white" stroke="rgba(0,0,0,0.2)" size={28} />;
  }
  if (icon === "board") return <BoardIcon />;
  if (icon === "special") return <SparkleIcon />;
  return <TacticsIcon />;
}

export default function LessonStop({
  lesson,
  index,
  status,
  stars,
  x,
  y,
  onTap,
  sparkle,
  unlocking,
  justUnlocked,
  onLockedTap,
}: LessonStopProps) {
  const [shaking, setShaking] = useState(false);

  const handleLockedTap = useCallback(() => {
    if (shaking) return;
    setShaking(true);
    onLockedTap?.();
    setTimeout(() => setShaking(false), 400);
  }, [shaking, onLockedTap]);

  // Color configs per status
  const nodeStyle: React.CSSProperties =
    status === "completed"
      ? {
          background: "linear-gradient(135deg, #B197FC 0%, #93C5FD 100%)",
          border: "4px solid white",
          boxShadow: "0 4px 0 #9775E6, 0 6px 16px rgba(151, 117, 230, 0.35)",
        }
      : status === "current"
        ? {
            background: "linear-gradient(135deg, #6EE7B7 0%, #34D399 100%)",
            border: "4px solid white",
            boxShadow: "0 4px 0 #10B981, 0 6px 16px rgba(16, 185, 129, 0.4)",
          }
        : {
            background: "#C4BED6",
            border: "4px solid #DDD8E8",
            boxShadow: "0 2px 0 #A8A2B8, 0 4px 8px rgba(0,0,0,0.08)",
          };

  const outerAnimClasses = [
    sparkle ? "animate-celebrate-pop" : "",
    unlocking ? "animate-lesson-unlock" : "",
    shaking ? "animate-chest-shake" : "",
  ].filter(Boolean).join(" ");

  return (
    <button
      className={`absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 journey-node ${
        status === "locked" && !unlocking ? "opacity-60 cursor-default" : "cursor-pointer"
      } ${outerAnimClasses}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={status !== "locked" ? onTap : handleLockedTap}
      aria-disabled={status === "locked" && !unlocking}
      aria-label={`Lesson ${index + 1}: ${lesson.id}${status === "locked" ? " (locked)" : ""}`}
    >
      {/* Sparkle burst ring */}
      {sparkle && (
        <div
          className="absolute -inset-4 rounded-full animate-light-burst pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(252,211,77,0.8) 0%, rgba(252,211,77,0.2) 50%, transparent 70%)" }}
        />
      )}

      {/* The round node */}
      <div
        className={`w-[60px] h-[60px] rounded-full flex items-center justify-center ${status === "current" ? "animate-gentle-bounce" : ""}${justUnlocked ? " animate-unlock-glow" : ""}`}
        style={nodeStyle}
      >
        <LessonIcon icon={lesson.icon} />
      </div>

      {/* Lesson number badge */}
      <div
        className="mt-1 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shadow-sm"
        style={{
          background: status === "completed" ? "var(--ck-purple)" : status === "current" ? "var(--ck-mint-dark)" : "#B4AEC6",
          color: "white",
          border: "2px solid white",
        }}
      >
        {index + 1}
      </div>

      {/* Stars for completed lessons */}
      {status === "completed" && (
        <div className="flex gap-0.5 mt-0.5">
          {Array.from({ length: 3 }, (_, i) => (
            <Image
              key={i}
              src={i < stars ? "/icons/icon-star-full.webp" : "/icons/icon-star-empty.webp"}
              alt={i < stars ? "Star earned" : "Star empty"}
              width={14}
              height={14}
              className="object-contain"
              style={{ width: 14, height: "auto" }}
            />
          ))}
        </div>
      )}
    </button>
  );
}
