"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { LESSONS } from "@/data/lessons";
import { CHESTS, getChestForLesson } from "@/data/chests";
import LessonStop from "@/components/LessonStop";
import TreasureChest from "@/components/TreasureChest";
import JourneyMapOnboarding from "@/components/JourneyMapOnboarding";
import PikuWithOutfit from "@/components/PikuWithOutfit";
import { useAudio } from "@/hooks/useAudio";
import type { LessonProgress } from "@/types/user";

interface JourneyMapProps {
  currentLesson: number;
  lessonProgress: Record<string, LessonProgress>;
  totalStars: number;
  openedChests: number[];
  completedLessons: string[];
  onLessonTap: (lessonId: string) => void;
  onChestTap: (chestIndex: number) => void;
  onLockedChestTap?: (chestIndex: number) => void;
  firestoreReady?: boolean;
  justCompletedLesson?: string | null;
  justUnlockedLesson?: number | null;
  onUnlockAnimationDone?: () => void;
  childName?: string;
  childId?: string;
  equippedOutfit?: { head?: string; body?: string };
}

/**
 * Position of the igloo door at the end of the path.
 * Pikku stands here when all lessons are completed.
 */
const IGLOO_POSITION = { x: 68, y: 7 };

/**
 * Hand-tuned lesson positions tracing the winding snowy path
 * in the illustrated background (journey-map-bg.webp, 1376×3104).
 * Coordinates are {x%, y%} of the map container.
 * Bottom of map = high y (start), top = low y (end).
 */
const LESSON_POSITIONS: { x: number; y: number }[] = [
  { x: 72, y: 94 },    //  1  Board Intro
  { x: 65, y: 88.3 },  //  2  How Chess Works
  { x: 46, y: 82.6 },  //  3  Pawn
  { x: 34, y: 76.9 },  //  4  Knight
  { x: 43, y: 71.1 },  //  5  Bishop
  { x: 67, y: 66 },    //  6  Rook
  { x: 68, y: 59.7 },  //  7  Queen
  { x: 43, y: 54 },    //  8  King
  { x: 51, y: 48.3 },  //  9  Check
  { x: 73, y: 42 },    // 10  Checkmate
  { x: 62, y: 36.9 },  // 11  Piece Values
  { x: 43, y: 32 },    // 12  Protecting
  { x: 50, y: 27 },    // 13  Castling
  { x: 54, y: 20.5 },  // 14  Promotion
  { x: 70, y: 17 },    // 15  Capstone
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
  0: { x: 25, y: 85 },       //  6★ — left side, after Pawn (lesson 3)
  1: { x: 69, y: 76 },       // 15★ — right side, after Bishop (lesson 5)
  2: { x: 22, y: 60 },       // 24★ — left side, after Queen (lesson 7)
  3: { x: 75, y: 46 },       // 33★ — right side, after Checkmate (lesson 10)
  4: { x: 25, y: 17 },       // 42★ — left side, after Promotion (lesson 14)
};

function getChestPosition(positionOnMap: number, _total: number, chestIndex: number) {
  if (CHEST_POSITIONS[chestIndex]) {
    return CHEST_POSITIONS[chestIndex];
  }
  // Fallback
  const y = 92 - positionOnMap * 84;
  return { x: 75, y };
}


export default function JourneyMap({
  currentLesson,
  lessonProgress,
  totalStars,
  openedChests,
  completedLessons,
  onLessonTap,
  onChestTap,
  onLockedChestTap,
  firestoreReady = true,
  justCompletedLesson,
  justUnlockedLesson,
  onUnlockAnimationDone,
  childName,
  childId,
  equippedOutfit,
}: JourneyMapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sfx, say } = useAudio();
  const [sparkleLesson, setSparkleLesson] = useState<string | null>(null);
  const [unlockingIndex, setUnlockingIndex] = useState<number | null>(null);
  const [glowingIndex, setGlowingIndex] = useState<number | null>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [pikuWalking, setPikuWalking] = useState(false);
  const [pikuPosition, setPikuPosition] = useState<{ x: number; y: number }>(() => {
    const allDone = currentLesson >= LESSONS.length;
    return allDone ? IGLOO_POSITION : getLessonPosition(currentLesson, LESSONS.length);
  });

  // Reset internal state when switching children
  const prevChildId = useRef(childId);
  useEffect(() => {
    if (childId === prevChildId.current) return;
    prevChildId.current = childId;
    setOnboardingDismissed(false);
    setSparkleLesson(null);
    setUnlockingIndex(null);
    setGlowingIndex(null);
    setPikuWalking(false);
  }, [childId]);

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
    const isAllComplete = justUnlockedLesson >= LESSONS.length;

    // Helper to scroll to a lesson index
    function scrollToLesson(index: number) {
      if (!container) return;
      const { y } = getLessonPosition(index, LESSONS.length);
      const mapHeight = container.scrollHeight;
      const targetScroll = (y / 100) * mapHeight - container.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
    }

    function scrollToPosition(pos: { y: number }) {
      if (!container) return;
      const mapHeight = container.scrollHeight;
      const targetScroll = (pos.y / 100) * mapHeight - container.clientHeight / 2;
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

    // 1000ms: start Piku walking to newly unlocked lesson (or igloo if all done)
    // Set walking state first so the CSS transition is applied,
    // then update position on the next frame so the transition animates.
    timers.push(setTimeout(() => {
      setPikuWalking(true);
      const newPos = isAllComplete ? IGLOO_POSITION : getLessonPosition(justUnlockedLesson, LESSONS.length);
      const oldPos = getLessonPosition(justUnlockedLesson - 1, LESSONS.length);

      // Delay position update by one frame so the transition CSS is applied first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPikuPosition(newPos);
        });
      });

      // Scroll to follow Piku during walk using rAF interpolation
      const walkDuration = 1500; // matches CSS transition duration
      const walkStart = performance.now();
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

    if (isAllComplete) {
      // All lessons done — Piku walks to igloo, play celebration
      timers.push(setTimeout(() => {
        setPikuWalking(false);
        setSparkleLesson(null);
        sfx("confetti");
        say("celebrate_all_complete");
      }, 2500));

      // Check for final chest too
      const newlyUnlockedChest = getChestForLesson(justCompletedLesson);
      const hasNewChest = newlyUnlockedChest && !openedChests.includes(newlyUnlockedChest.index);

      if (hasNewChest) {
        timers.push(setTimeout(() => {
          const chestPos = getChestPosition(newlyUnlockedChest.positionOnMap, LESSONS.length, newlyUnlockedChest.index);
          scrollToPosition(chestPos);
          say("chest_appeared");
        }, 4000));

        timers.push(setTimeout(() => {
          onUnlockAnimationDone?.();
        }, 7000));
      } else {
        timers.push(setTimeout(() => {
          onUnlockAnimationDone?.();
        }, 4000));
      }
    } else {
      // 2500ms: walking done, trigger unlock animation on newly unlocked lesson
      timers.push(setTimeout(() => {
        setPikuWalking(false);
        setSparkleLesson(null);
        setUnlockingIndex(justUnlockedLesson);
        sfx("chest-open");
      }, 2500));

      // 3100ms: clear unlock animation, start persistent glow
      timers.push(setTimeout(() => {
        setUnlockingIndex(null);
        setGlowingIndex(justUnlockedLesson);
      }, 3100));

      // Check if this lesson completion unlocked a chest
      const newlyUnlockedChest = getChestForLesson(justCompletedLesson);
      const hasNewChest = newlyUnlockedChest && !openedChests.includes(newlyUnlockedChest.index);

      if (hasNewChest) {
        // 4000ms: scroll to the newly unlocked chest + Piku voice callout
        timers.push(setTimeout(() => {
          setGlowingIndex(null);
          const chestPos = getChestPosition(newlyUnlockedChest.positionOnMap, LESSONS.length, newlyUnlockedChest.index);
          scrollToPosition(chestPos);
          say("chest_appeared");
        }, 4000));

        // 7000ms: done — chest stays glowing on map via existing unlocked styling
        timers.push(setTimeout(() => {
          onUnlockAnimationDone?.();
        }, 7000));
      } else {
        // No chest — finish normally
        timers.push(setTimeout(() => {
          onUnlockAnimationDone?.();
        }, 3100));

        // 6100ms: clear glow
        timers.push(setTimeout(() => {
          setGlowingIndex(null);
        }, 6100));
      }
    }

    return () => timers.forEach(clearTimeout);
  }, [justCompletedLesson, justUnlockedLesson, sfx, say, openedChests, onUnlockAnimationDone]);

  const handleLockedTap = useCallback(() => {
    sfx("wrong-move");
  }, [sfx]);

  return (
    <div
      ref={scrollRef}
      className="relative w-full h-dvh overflow-y-auto overflow-x-hidden"
    >
      {/* Container uses aspect-ratio to match the background image (1376×3104)
           so lesson nodes placed at % positions always align with the illustrated path,
           without stretching the image. */}
      <div
        className="relative w-full"
        style={{ aspectRatio: "1376 / 3104" }}
      >
        {/* Illustrated journey map background */}
        <img
          src="/journey-map-bg.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
        />

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
          } else if (completedLessons.includes(chest.afterLesson)) {
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
        {!(firestoreReady && currentLesson === 0 && !onboardingDismissed && !justCompletedLesson) && (() => {
          const allDone = currentLesson >= LESSONS.length;
          return (
            <div
              className={`absolute pointer-events-none -translate-y-1/2 journey-piku${pikuWalking ? " animate-piku-walk-bounce" : ""}`}
              style={{
                left: allDone
                  ? `${pikuPosition.x}%`
                  : `calc(${pikuPosition.x}% + clamp(20px, 8vw, 36px))`,
                top: `${pikuPosition.y}%`,
                transition: pikuWalking ? "left 1.5s ease-in-out, top 1.5s ease-in-out" : "none",
              }}
            >
              <PikuWithOutfit
                expression={allDone ? "standing-celebrating" : "standing-happy"}
                headImage={equippedOutfit?.head}
                bodyImage={equippedOutfit?.body}
                size={72}
              />
            </div>
          );
        })()}

        {/* First-time onboarding overlay — stays until player taps first lesson */}
        {firestoreReady && currentLesson === 0 && !onboardingDismissed && !justCompletedLesson && (() => {
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
