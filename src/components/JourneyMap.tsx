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
  childName?: string;
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
  0: { x: 72.5, y: 90 },    //  4★ — right side, between L1-L2
  1: { x: 20, y: 84 },      //  8★ — left side, between L2-L3
  2: { x: 60.75, y: 78 },   // 12★ — right side, between L3-L4
  3: { x: 25, y: 72 },      // 16★ — left side, between L4-L5
  4: { x: 75, y: 66 },      // 18★ — right side, between L5-L6
  5: { x: 22, y: 60 },      // 22★ — left side, between L6-L7
  6: { x: 68, y: 54 },      // 26★ — right side, between L7-L8
  7: { x: 38, y: 42 },      // 30★ — left side, between L9-L10
  8: { x: 75, y: 36 },      // 34★ — right side, between L10-L11
  9: { x: 26, y: 24 },      // 38★ — left side, between L12-L13
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
  childName,
}: JourneyMapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sfx } = useAudio();
  const [sparkleLesson, setSparkleLesson] = useState<string | null>(null);
  const [unlockingIndex, setUnlockingIndex] = useState<number | null>(null);
  const [glowingIndex, setGlowingIndex] = useState<number | null>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [pikuWalking, setPikuWalking] = useState(false);
  const [pikuPosition, setPikuPosition] = useState<{ x: number; y: number }>(() => {
    const allDone = currentLesson >= LESSONS.length;
    return allDone ? IGLOO_POSITION : getLessonPosition(currentLesson, LESSONS.length);
  });

  // Keep Piku position in sync when currentLesson changes (not during walk animation)
  useEffect(() => {
    if (pikuWalking) return;
    const allDone = currentLesson >= LESSONS.length;
    setPikuPosition(allDone ? IGLOO_POSITION : getLessonPosition(currentLesson, LESSONS.length));
  }, [currentLesson, pikuWalking]);

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

    // 1000ms: start Piku walking to newly unlocked lesson
    timers.push(setTimeout(() => {
      setPikuWalking(true);
      const newPos = getLessonPosition(justUnlockedLesson, LESSONS.length);
      setPikuPosition(newPos);

      // Scroll to follow Piku during walk using rAF interpolation
      const walkDuration = 1500; // matches CSS transition duration
      const walkStart = performance.now();
      const oldPos = getLessonPosition(justUnlockedLesson - 1, LESSONS.length);
      let rafId: number;
      function scrollFollow(now: number) {
        if (!container) return;
        const elapsed = now - walkStart;
        const t = Math.min(elapsed / walkDuration, 1);
        // Ease-in-out interpolation to match CSS transition
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const currentY = oldPos.y + (newPos.y - oldPos.y) * ease;
        const mapHeight = container.scrollHeight;
        const targetScroll = (currentY / 100) * mapHeight - container.clientHeight / 2;
        container.scrollTo({ top: Math.max(0, targetScroll) });
        if (t < 1) {
          rafId = requestAnimationFrame(scrollFollow);
        }
      }
      rafId = requestAnimationFrame(scrollFollow);
      // Store rafId cleanup
      timers.push(setTimeout(() => cancelAnimationFrame(rafId), walkDuration + 100) as unknown as ReturnType<typeof setTimeout>);
    }, 1000));

    // 2500ms: walking done, trigger unlock animation on newly unlocked lesson
    timers.push(setTimeout(() => {
      setPikuWalking(false);
      setSparkleLesson(null);
      setUnlockingIndex(justUnlockedLesson);
      sfx("chest-open");
    }, 2500));

    // 3100ms: clear unlock animation, start persistent glow, call done
    timers.push(setTimeout(() => {
      setUnlockingIndex(null);
      setGlowingIndex(justUnlockedLesson);
      onUnlockAnimationDone?.();
    }, 3100));

    // 6100ms: clear glow (CSS animation is 3s)
    timers.push(setTimeout(() => {
      setGlowingIndex(null);
    }, 6100));

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

        {/* Igloo glow when all lessons are completed */}
        {currentLesson >= LESSONS.length && (
          <div
            className="absolute pointer-events-none rounded-full animate-igloo-glow"
            style={{
              left: `${IGLOO_POSITION.x}%`,
              top: `${IGLOO_POSITION.y}%`,
              width: "clamp(40px, 12vw, 72px)",
              height: "clamp(40px, 12vw, 72px)",
              transform: "translate(-50%, -50%)",
            }}
          />
        )}

        {/* Piku mascot standing next to current lesson, or at the igloo when all done */}
        {!(currentLesson === 0 && !onboardingDismissed && !justCompletedLesson) && (() => {
          const allDone = currentLesson >= LESSONS.length;
          return (
            <div
              className={`absolute pointer-events-none -translate-y-1/2 journey-piku${pikuWalking ? " animate-piku-walk-bounce" : ""}`}
              style={{
                left: allDone
                  ? `${pikuPosition.x}%`
                  : `calc(${pikuPosition.x}% + clamp(20px, 8vw, 36px))`,
                top: `${pikuPosition.y}%`,
                ...(pikuWalking
                  ? { transition: "left 1.5s ease-in-out, top 1.5s ease-in-out" }
                  : {}),
              }}
            >
              <Piku expression={allDone ? "standing-celebrating" : "standing-happy"} size={72} />
            </div>
          );
        })()}

        {/* First-time onboarding overlay — stays until player taps first lesson */}
        {currentLesson === 0 && !onboardingDismissed && !justCompletedLesson && (() => {
          const pos = getLessonPosition(0, LESSONS.length);
          return (
            <JourneyMapOnboarding
              x={pos.x}
              y={pos.y}
              childName={childName ?? ""}
              onDismiss={() => setOnboardingDismissed(true)}
            />
          );
        })()}
      </div>
    </div>
  );
}
