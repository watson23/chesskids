"use client";

import { useState, useCallback, useMemo } from "react";
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

/** Floating sparkle particles around unlocked chests */
const SPARKLE_COUNT = 6;
function ChestSparkles() {
  const sparkles = useMemo(
    () =>
      Array.from({ length: SPARKLE_COUNT }, (_, i) => {
        const angle = (i / SPARKLE_COUNT) * 360;
        const radius = 38 + (i % 2) * 10;
        const size = 6 + (i % 3) * 2;
        const delay = (i * 0.4).toFixed(1);
        const shape = i % 3; // 0=star, 1=diamond, 2=circle
        return { angle, radius, size, delay, shape, id: i };
      }),
    []
  );

  return (
    <>
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute animate-chest-sparkle pointer-events-none"
          style={{
            width: s.size,
            height: s.size,
            left: "50%",
            top: "50%",
            animationDelay: `${s.delay}s`,
            "--sparkle-angle": `${s.angle}deg`,
            "--sparkle-radius": `${s.radius}px`,
          } as React.CSSProperties}
        >
          {s.shape === 0 ? (
            <svg width={s.size} height={s.size} viewBox="0 0 10 10">
              <path d="M5 0 L6 3.5 L10 4 L7 6.5 L8 10 L5 8 L2 10 L3 6.5 L0 4 L4 3.5 Z" fill="#FCD34D" />
            </svg>
          ) : s.shape === 1 ? (
            <div
              className="w-full h-full"
              style={{ background: "#FDE68A", transform: "rotate(45deg)" }}
            />
          ) : (
            <div
              className="w-full h-full rounded-full"
              style={{ background: "#FBBF24" }}
            />
          )}
        </div>
      ))}
    </>
  );
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
      {/* Golden glow + floating sparkles around unlocked chests */}
      {status === "unlocked" && (
        <>
          <div
            className="absolute -inset-6 rounded-full animate-chest-glow"
            style={{
              background: "radial-gradient(circle, rgba(252,211,77,0.5) 0%, rgba(251,191,36,0.2) 50%, transparent 70%)",
            }}
          />
          <ChestSparkles />
        </>
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
