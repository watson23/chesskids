"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { LESSONS } from "@/data/lessons";
import { CHESTS } from "@/data/chests";
import LessonStop from "@/components/LessonStop";
import TreasureChest from "@/components/TreasureChest";
import JourneyMapOnboarding from "@/components/JourneyMapOnboarding";
import { useAudio } from "@/hooks/useAudio";
import type { LessonProgress } from "@/types/user";

interface JourneyMapProps {
  currentLesson: number;
  lessonProgress: Record<string, LessonProgress>;
  totalStars: number;
  openedChests: number[];
  onLessonTap: (lessonId: string) => void;
  onChestTap: (chestIndex: number) => void;
  onLockedChestTap?: (chestIndex: number) => void;
  justCompletedLesson?: string | null;
  justUnlockedLesson?: number | null;
  onUnlockAnimationDone?: () => void;
}

/**
 * Lesson positions: gentle S-curve with plenty of vertical spacing.
 * Each node gets ~7.5% of vertical space (total ~97.5% for 13 nodes).
 * Horizontal wave is gentle: ±18% from center with only 1.5 oscillations.
 */
function getLessonPosition(index: number, total: number) {
  const progress = index / (total - 1);
  // Bottom of map = high y (start), top = low y (end)
  const y = 92 - progress * 84;
  // Gentle sine wave — 1.5 oscillations, ±18 from center
  const x = 50 + Math.sin(progress * Math.PI * 3) * 18;
  return { x, y };
}

/**
 * Chest positions: placed to the opposite side of the path from nearby lessons.
 */
function getChestPosition(positionOnMap: number, total: number) {
  const y = 92 - positionOnMap * 84;
  // Path goes right when sin > 0, so put chest on the opposite side
  const pathX = Math.sin(positionOnMap * Math.PI * 3) * 18;
  const chestOffset = pathX > 0 ? -20 : 20;
  const x = 50 + pathX + chestOffset;
  return { x: Math.max(10, Math.min(90, x)), y };
}

function buildPathData(total: number): string {
  const points = Array.from({ length: total }, (_, i) =>
    getLessonPosition(i, total)
  );
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
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
  onLockedChestTap,
  justCompletedLesson,
  justUnlockedLesson,
  onUnlockAnimationDone,
}: JourneyMapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sfx } = useAudio();
  const [sparkleLesson, setSparkleLesson] = useState<string | null>(null);
  const [unlockingIndex, setUnlockingIndex] = useState<number | null>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  // Auto-scroll to current lesson on mount / lesson change
  useEffect(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const { y } = getLessonPosition(currentLesson, LESSONS.length);
    const mapHeight = container.scrollHeight;
    const targetScroll = (y / 100) * mapHeight - container.clientHeight / 2;
    container.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
  }, [currentLesson]);

  // Unlock animation sequence
  useEffect(() => {
    if (!justCompletedLesson || justUnlockedLesson == null || !scrollRef.current) return;

    const container = scrollRef.current;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Helper to scroll to a lesson index
    function scrollToLesson(index: number) {
      if (!container) return;
      const { y } = getLessonPosition(index, LESSONS.length);
      const mapHeight = container.scrollHeight;
      const targetScroll = (y / 100) * mapHeight - container.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
    }

    // 0ms: scroll to completed lesson
    const completedIndex = LESSONS.findIndex((l) => l.id === justCompletedLesson);
    if (completedIndex >= 0) scrollToLesson(completedIndex);

    // 500ms: sparkle on completed lesson
    timers.push(setTimeout(() => {
      setSparkleLesson(justCompletedLesson);
      sfx("confetti");
    }, 500));

    // 1500ms: scroll to newly unlocked lesson
    timers.push(setTimeout(() => {
      scrollToLesson(justUnlockedLesson);
    }, 1500));

    // 2000ms: trigger unlock animation on newly unlocked lesson
    timers.push(setTimeout(() => {
      setSparkleLesson(null);
      setUnlockingIndex(justUnlockedLesson);
      sfx("chest-open");
    }, 2000));

    // 3000ms: clear animation, call done
    timers.push(setTimeout(() => {
      setUnlockingIndex(null);
      onUnlockAnimationDone?.();
    }, 3000));

    return () => timers.forEach(clearTimeout);
  }, [justCompletedLesson, justUnlockedLesson, sfx, onUnlockAnimationDone]);

  const handleLockedTap = useCallback(() => {
    sfx("wrong-move");
  }, [sfx]);

  const pathData = buildPathData(LESSONS.length);

  return (
    <div
      ref={scrollRef}
      className="relative w-full h-dvh overflow-y-auto overflow-x-hidden"
    >
      <div
        className="relative w-full"
        style={{ minHeight: "200vh" }}
      >
        {/* Cool pastel gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, #DBD5F7 0%, #E8E2FF 15%, #F5F0FF 35%, #FFF0F5 55%, #F0F0FF 75%, #E8E2FF 100%)",
          }}
        />

        {/* Decorative SVG scenery */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Soft clouds */}
          <ellipse cx="12" cy="3" rx="7" ry="2" fill="white" opacity="0.65" />
          <ellipse cx="17" cy="2.5" rx="4" ry="1.5" fill="white" opacity="0.5" />
          <ellipse cx="75" cy="5" rx="9" ry="2.5" fill="white" opacity="0.55" />
          <ellipse cx="82" cy="4.5" rx="5" ry="2" fill="white" opacity="0.4" />
          <ellipse cx="40" cy="1.5" rx="6" ry="1.5" fill="white" opacity="0.4" />

          {/* Decorative circles — spread out to not overlap nodes */}
          <circle cx="6" cy="85" r="3" fill="#B197FC" opacity="0.1" />
          <circle cx="94" cy="70" r="3.5" fill="#FDA4AF" opacity="0.1" />
          <circle cx="8" cy="50" r="2.5" fill="#93C5FD" opacity="0.1" />
          <circle cx="92" cy="35" r="3" fill="#B197FC" opacity="0.08" />
          <circle cx="6" cy="20" r="2" fill="#6EE7B7" opacity="0.1" />
          <circle cx="94" cy="15" r="2.5" fill="#FDA4AF" opacity="0.08" />

          {/* Path glow */}
          <path
            d={pathData}
            fill="none"
            stroke="#B197FC"
            strokeWidth="3"
            opacity={0.08}
            strokeLinecap="round"
          />
          {/* Main dotted trail */}
          <path
            d={pathData}
            fill="none"
            stroke="#B197FC"
            strokeWidth="1.5"
            strokeDasharray="2.5,2"
            strokeLinecap="round"
            opacity={0.35}
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
              index={index}
              status={status}
              stars={progress?.stars ?? 0}
              x={x}
              y={y}
              onTap={() => onLessonTap(lesson.id)}
              sparkle={sparkleLesson === lesson.id}
              unlocking={unlockingIndex === index}
              onLockedTap={handleLockedTap}
            />
          );
        })}

        {/* Treasure chests */}
        {CHESTS.map((chest) => {
          const { x, y } = getChestPosition(chest.positionOnMap, LESSONS.length);

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
              totalStars={totalStars}
              onTap={() => onChestTap(chest.index)}
              onLockedTap={() => {
                handleLockedTap();
                onLockedChestTap?.(chest.index);
              }}
            />
          );
        })}

        {/* First-time onboarding overlay */}
        {currentLesson === 0 && !onboardingDismissed && !justCompletedLesson && (() => {
          const pos = getLessonPosition(0, LESSONS.length);
          return (
            <JourneyMapOnboarding
              x={pos.x}
              y={pos.y}
              onDismiss={() => setOnboardingDismissed(true)}
            />
          );
        })()}
      </div>
    </div>
  );
}
