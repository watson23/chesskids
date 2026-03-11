"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { LESSONS } from "@/data/lessons";
import { CHESTS } from "@/data/chests";
import LessonStop from "@/components/LessonStop";
import TreasureChest from "@/components/TreasureChest";
import JourneyMapOnboarding from "@/components/JourneyMapOnboarding";
import Piku from "@/components/Piku";
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
 * Position of the igloo door at the end of the path.
 * Pikku stands here when all lessons are completed.
 */
const IGLOO_POSITION = { x: 25, y: 12 };

/**
 * Hand-tuned lesson positions tracing the winding snowy path
 * in the illustrated background (journey-map-bg.webp).
 * Coordinates are {x%, y%} of the map container.
 * Bottom of map = high y (start), top = low y (end).
 * Lessons use the bottom ~70%, leaving the top for future lessons.
 */
const LESSON_POSITIONS: { x: number; y: number }[] = [
  { x: 54, y: 93 },  // 1  Board Intro      — good
  { x: 40, y: 87 },  // 2  Pawn             — nudge left
  { x: 35, y: 81 },  // 3  Knight
  { x: 42, y: 75 },  // 4  Bishop
  { x: 60, y: 69 },  // 5  Rook             — 0.5 bubble up
  { x: 71, y: 63 },  // 6  Queen
  { x: 52, y: 57 },  // 7  King
  { x: 44, y: 51 },  // 8  Castling         — nudge left
  { x: 58, y: 45 },  // 9  En Passant       — 0.5 bubble left
  { x: 72, y: 39 },  // 10 Promotion        — 0.5 more right
  { x: 57, y: 33 },  // 11 Check & Checkmate — 1 bubble right
  { x: 42, y: 27 },  // 12 Forks            — 1 bubble right
  { x: 44, y: 21 },  // 13 Pins             — 1.5 bubbles right
];

function getLessonPosition(index: number, _total: number) {
  if (index < LESSON_POSITIONS.length) {
    return LESSON_POSITIONS[index];
  }
  // Fallback for future lessons beyond the hand-tuned list
  const lastPos = LESSON_POSITIONS[LESSON_POSITIONS.length - 1];
  const extra = index - LESSON_POSITIONS.length + 1;
  return { x: 50 + Math.sin(extra * 1.2) * 15, y: Math.max(5, lastPos.y - extra * 6) };
}

/**
 * Hand-tuned chest positions placed on the opposite side of the path.
 * Keyed by chest index.
 */
const CHEST_POSITIONS: Record<number, { x: number; y: number }> = {
  0: { x: 72.5, y: 80.75 }, // 6★  — right side, on the chessboard circle
  1: { x: 22, y: 63.5 },  // 15★ — left side, between lessons 5-6
  2: { x: 60.75, y: 52.75 }, // 24★ — right side, between lessons 7-8
  3: { x: 22, y: 47 },    // 33★ — left side, between lessons 9-10
  4: { x: 77, y: 23 },    // 39★ — right side, near lessons 12-13
};

function getChestPosition(positionOnMap: number, _total: number, chestIndex: number) {
  if (CHEST_POSITIONS[chestIndex]) {
    return CHEST_POSITIONS[chestIndex];
  }
  // Fallback
  const y = 92 - positionOnMap * 84;
  return { x: 75, y };
}

function buildPathData(total: number): string {
  const count = Math.min(total, LESSON_POSITIONS.length);
  const points = Array.from({ length: count }, (_, i) => LESSON_POSITIONS[i]);
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
  const [glowingIndex, setGlowingIndex] = useState<number | null>(null);
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

    // 300ms: sparkle on completed lesson
    timers.push(setTimeout(() => {
      setSparkleLesson(justCompletedLesson);
      sfx("confetti");
    }, 300));

    // 1000ms: scroll to newly unlocked lesson
    timers.push(setTimeout(() => {
      scrollToLesson(justUnlockedLesson);
    }, 1000));

    // 1400ms: trigger unlock animation on newly unlocked lesson
    timers.push(setTimeout(() => {
      setSparkleLesson(null);
      setUnlockingIndex(justUnlockedLesson);
      sfx("chest-open");
    }, 1400));

    // 2200ms: clear unlock animation, start persistent glow, call done
    timers.push(setTimeout(() => {
      setUnlockingIndex(null);
      setGlowingIndex(justUnlockedLesson);
      onUnlockAnimationDone?.();
    }, 2200));

    // 5200ms: clear glow (CSS animation is 3s)
    timers.push(setTimeout(() => {
      setGlowingIndex(null);
    }, 5200));

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
      {/* Container uses aspect-ratio to match the background image (1024×1536 = 2:3)
           so lesson nodes placed at % positions always align with the illustrated path,
           without stretching the image. */}
      <div
        className="relative w-full"
        style={{ aspectRatio: "1024 / 1536" }}
      >
        {/* Illustrated journey map background */}
        <img
          src="/journey-map-bg.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
        />

        {/* Dotted trail connecting lesson nodes */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Path glow */}
          <path
            d={pathData}
            fill="none"
            stroke="white"
            strokeWidth="3"
            opacity={0.35}
            strokeLinecap="round"
          />
          {/* Main dotted trail */}
          <path
            d={pathData}
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeDasharray="2.5,2"
            strokeLinecap="round"
            opacity={0.7}
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
              justUnlocked={glowingIndex === index}
              onLockedTap={handleLockedTap}
            />
          );
        })}

        {/* Treasure chests */}
        {CHESTS.map((chest) => {
          const { x, y } = getChestPosition(chest.positionOnMap, LESSONS.length, chest.index);

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

        {/* Piku mascot standing next to current lesson, or at the igloo when all done */}
        {!(currentLesson === 0 && !onboardingDismissed && !justCompletedLesson) && (() => {
          const allDone = currentLesson >= LESSONS.length;
          const pos = allDone ? IGLOO_POSITION : getLessonPosition(currentLesson, LESSONS.length);
          return (
            <div
              className="absolute pointer-events-none -translate-y-1/2 journey-piku"
              style={{
                left: allDone
                  ? `${pos.x}%`
                  : `calc(${pos.x}% + clamp(20px, 8vw, 36px))`,
                top: `${pos.y}%`,
              }}
            >
              <Piku expression={allDone ? "celebrating" : "happy"} size={72} />
            </div>
          );
        })()}

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
