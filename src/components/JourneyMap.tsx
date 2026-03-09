"use client";

import { useRef, useEffect } from "react";
import { LESSONS } from "@/data/lessons";
import { CHESTS } from "@/data/chests";
import LessonStop from "@/components/LessonStop";
import TreasureChest from "@/components/TreasureChest";
import type { LessonProgress } from "@/types/user";

interface JourneyMapProps {
  currentLesson: number;
  lessonProgress: Record<string, LessonProgress>;
  totalStars: number;
  openedChests: number[];
  onLessonTap: (lessonId: string) => void;
  onChestTap: (chestIndex: number) => void;
}

/**
 * Compute X,Y positions for each lesson stop along a winding S-curve path.
 * Y: spread from 90% (bottom) to 10% (top) — the journey goes upward.
 * X: sine wave for winding effect.
 */
function getLessonPosition(index: number, total: number) {
  const progress = index / (total - 1);
  const y = 90 - progress * 80; // 90% at bottom to 10% at top
  const x = 50 + Math.sin(progress * Math.PI * 2.5) * 25;
  return { x, y };
}

function getChestPosition(positionOnMap: number) {
  // positionOnMap is 0-1, map it to the same coordinate system
  const y = 90 - positionOnMap * 80;
  const x = 50 + Math.sin(positionOnMap * Math.PI * 2.5) * 25 + 15;
  // Clamp X so it stays within bounds
  return { x: Math.min(x, 90), y };
}

/** Generate SVG path data for the winding trail connecting lesson stops. */
function buildPathData(total: number): string {
  const points = Array.from({ length: total }, (_, i) =>
    getLessonPosition(i, total)
  );

  if (points.length === 0) return "";

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    // Use quadratic bezier for smooth curves
    const cpX = (prev.x + curr.x) / 2;
    const cpY = (prev.y + curr.y) / 2;
    d += ` Q ${prev.x} ${(prev.y + cpY) / 2}, ${cpX} ${cpY}`;
    d += ` Q ${curr.x} ${(cpY + curr.y) / 2}, ${curr.x} ${curr.y}`;
  }

  return d;
}

export default function JourneyMap({
  currentLesson,
  lessonProgress,
  totalStars,
  openedChests,
  onLessonTap,
  onChestTap,
}: JourneyMapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // On mount, scroll to the current lesson
  useEffect(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const { y } = getLessonPosition(currentLesson, LESSONS.length);
    // y is a percentage of the map height
    const mapHeight = container.scrollHeight;
    const targetScroll = (y / 100) * mapHeight - container.clientHeight / 2;
    container.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
  }, [currentLesson]);

  const pathData = buildPathData(LESSONS.length);

  return (
    <div
      ref={scrollRef}
      className="relative w-full h-dvh overflow-y-auto overflow-x-hidden"
    >
      {/* Background gradient */}
      <div
        className="relative w-full"
        style={{ minHeight: "150vh" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-green-100 to-amber-100" />

        {/* SVG path connecting stops */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={pathData}
            fill="none"
            stroke="#92400e"
            strokeWidth="0.6"
            strokeDasharray="1.5,1"
            strokeLinecap="round"
            opacity={0.5}
          />
        </svg>

        {/* Lesson stops */}
        {LESSONS.map((lesson, index) => {
          const { x, y } = getLessonPosition(index, LESSONS.length);
          const progress = lessonProgress[lesson.id];

          let status: "completed" | "current" | "locked";
          if (index < currentLesson) {
            status = "completed";
          } else if (index === currentLesson) {
            status = "current";
          } else {
            status = "locked";
          }

          return (
            <LessonStop
              key={lesson.id}
              lesson={lesson}
              status={status}
              stars={progress?.stars ?? 0}
              x={x}
              y={y}
              onTap={() => onLessonTap(lesson.id)}
            />
          );
        })}

        {/* Treasure chests */}
        {CHESTS.map((chest) => {
          const { x, y } = getChestPosition(chest.positionOnMap);

          let chestStatus: "locked" | "unlocked" | "opened";
          if (openedChests.includes(chest.index)) {
            chestStatus = "opened";
          } else if (totalStars >= chest.starsRequired) {
            chestStatus = "unlocked";
          } else {
            chestStatus = "locked";
          }

          return (
            <TreasureChest
              key={chest.index}
              chest={chest}
              status={chestStatus}
              x={x}
              y={y}
              onTap={() => onChestTap(chest.index)}
            />
          );
        })}
      </div>
    </div>
  );
}
