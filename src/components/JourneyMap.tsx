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

// ── Helpers ──────────────────────────────────────────────────────────

/** Cancellable delay for async animation sequences. */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
    const id = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(id); reject(new DOMException("Aborted", "AbortError")); }, { once: true });
  });
}

/** Compute the CSS `left` value for Piku at a given position. */
function pikuLeftCSS(pos: { x: number }, atIgloo: boolean): string {
  return atIgloo ? `${pos.x}%` : `calc(${pos.x}% + clamp(20px, 8vw, 36px))`;
}

/** Compute the CSS `top` value for Piku at a given position (vertically centered without transforms). */
function pikuTopCSS(pos: { y: number }): string {
  return `calc(${pos.y}% - clamp(20px, 5vw, 36px))`;
}

/** Responsive Piku size as a CSS clamp value. */
const PIKU_CSS_SIZE = "clamp(40px, 10vw, 72px)";

// ── Component ────────────────────────────────────────────────────────

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
  const pikuRef = useRef<HTMLDivElement>(null);
  const walkingRef = useRef(false);
  const { sfx, say } = useAudio();
  const [sparkleLesson, setSparkleLesson] = useState<string | null>(null);
  const [unlockingIndex, setUnlockingIndex] = useState<number | null>(null);
  const [glowingIndex, setGlowingIndex] = useState<number | null>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  const allDone = currentLesson >= LESSONS.length;

  // Reset internal state when switching children
  const prevChildId = useRef(childId);
  useEffect(() => {
    if (childId === prevChildId.current) return;
    prevChildId.current = childId;
    setOnboardingDismissed(false);
    setSparkleLesson(null);
    setUnlockingIndex(null);
    setGlowingIndex(null);
    walkingRef.current = false;
  }, [childId]);

  // ── Imperative Piku positioning ────────────────────────────────────
  // Set Piku's position directly via ref (no state, no re-renders).
  useEffect(() => {
    if (walkingRef.current || !pikuRef.current) return;
    const pos = allDone ? IGLOO_POSITION : getLessonPosition(currentLesson, LESSONS.length);
    pikuRef.current.style.left = pikuLeftCSS(pos, allDone);
    pikuRef.current.style.top = pikuTopCSS(pos);
  }, [currentLesson, allDone]);

  // ── Auto-scroll to current lesson on mount / lesson change ─────────
  useEffect(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const { y } = getLessonPosition(currentLesson, LESSONS.length);
    const mapHeight = container.scrollHeight;
    const targetScroll = (y / 100) * mapHeight - container.clientHeight / 2;
    container.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
  }, [currentLesson]);

  // ── WAAPI-based walk animation ─────────────────────────────────────
  const walkPikuTo = useCallback((newPos: { x: number; y: number }, atIgloo: boolean): Animation | null => {
    const el = pikuRef.current;
    const container = scrollRef.current;
    if (!el || !container) return null;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Read current position
    const oldLeft = el.style.left;
    const oldTop = el.style.top;
    const newLeft = pikuLeftCSS(newPos, atIgloo);
    const newTop = pikuTopCSS(newPos);

    if (reducedMotion) {
      // Instant teleport
      el.style.left = newLeft;
      el.style.top = newTop;
      return null;
    }

    // Parse old Y% for scroll interpolation
    // oldTop is like "calc(72% - clamp(...))" — extract the percentage
    const oldYMatch = oldTop.match(/([\d.]+)%/);
    const oldY = oldYMatch ? parseFloat(oldYMatch[1]) : newPos.y;

    walkingRef.current = true;

    // Build keyframes with walk bounce overlaid.
    // We use 5 keyframes to create 2 bounce cycles during the walk.
    const keyframes: Keyframe[] = [
      { left: oldLeft, top: oldTop, offset: 0 },
      { left: oldLeft, top: oldTop, transform: "translateY(-4px)", offset: 0.15 },
      { left: newLeft, top: newTop, transform: "translateY(0px)", offset: 0.35 },
      { left: newLeft, top: newTop, transform: "translateY(-4px)", offset: 0.55 },
      { left: newLeft, top: newTop, transform: "translateY(0px)", offset: 0.75 },
      { left: newLeft, top: newTop, transform: "translateY(-3px)", offset: 0.9 },
      { left: newLeft, top: newTop, transform: "translateY(0px)", offset: 1 },
    ];

    const animation = el.animate(keyframes, {
      duration: 1500,
      easing: "ease-in-out",
      fill: "forwards",
    });

    // Scroll follow: read animation progress each frame for perfect sync
    let rafId: number;
    function followScroll() {
      if (!container) return;
      const timing = animation.effect?.getComputedTiming();
      const progress = typeof timing?.progress === "number" ? timing.progress : 0;
      const currentY = oldY + (newPos.y - oldY) * progress;
      const mapHeight = container.scrollHeight;
      const targetScroll = (currentY / 100) * mapHeight - container.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, targetScroll) });
      if (animation.playState !== "finished" && animation.playState !== "idle") {
        rafId = requestAnimationFrame(followScroll);
      }
    }
    rafId = requestAnimationFrame(followScroll);

    animation.finished.then(() => {
      cancelAnimationFrame(rafId);
      // Commit final styles and remove the WAAPI fill
      el.style.left = newLeft;
      el.style.top = newTop;
      animation.cancel();
      walkingRef.current = false;
    }).catch(() => {
      // Animation was cancelled (e.g. component unmount)
      cancelAnimationFrame(rafId);
      walkingRef.current = false;
    });

    return animation;
  }, []);

  // ── Scroll helpers ─────────────────────────────────────────────────
  const scrollToLesson = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const { y } = getLessonPosition(index, LESSONS.length);
    const mapHeight = scrollRef.current.scrollHeight;
    const targetScroll = (y / 100) * mapHeight - scrollRef.current.clientHeight / 2;
    scrollRef.current.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
  }, []);

  const scrollToPosition = useCallback((pos: { y: number }) => {
    if (!scrollRef.current) return;
    const mapHeight = scrollRef.current.scrollHeight;
    const targetScroll = (pos.y / 100) * mapHeight - scrollRef.current.clientHeight / 2;
    scrollRef.current.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
  }, []);

  // ── Unlock animation sequence (async with AbortController) ─────────
  useEffect(() => {
    if (!justCompletedLesson || justUnlockedLesson == null || !scrollRef.current) return;

    const controller = new AbortController();
    const { signal } = controller;
    const isAllComplete = justUnlockedLesson >= LESSONS.length;

    (async () => {
      try {
        // Step 1: Scroll to completed lesson
        const completedIndex = LESSONS.findIndex((l) => l.id === justCompletedLesson);
        if (completedIndex >= 0) scrollToLesson(completedIndex);

        // Step 2: Sparkle on completed lesson
        await delay(300, signal);
        setSparkleLesson(justCompletedLesson);
        sfx("confetti");

        // Step 3: Walk Piku to newly unlocked lesson (or igloo)
        await delay(700, signal);
        const newPos = isAllComplete ? IGLOO_POSITION : getLessonPosition(justUnlockedLesson, LESSONS.length);
        const walkAnim = walkPikuTo(newPos, isAllComplete);
        if (walkAnim) {
          await walkAnim.finished;
        }

        // Step 4: Post-walk actions
        setSparkleLesson(null);

        if (isAllComplete) {
          sfx("confetti");
          say("celebrate_all_complete");
        } else {
          setUnlockingIndex(justUnlockedLesson);
          sfx("chest-open");
          await delay(600, signal);
          setUnlockingIndex(null);
          setGlowingIndex(justUnlockedLesson);
        }

        // Step 5: Check for newly unlocked chest
        const newlyUnlockedChest = getChestForLesson(justCompletedLesson);
        const hasNewChest = newlyUnlockedChest && !openedChests.includes(newlyUnlockedChest.index);

        if (hasNewChest) {
          await delay(1500, signal);
          const chestPos = getChestPosition(newlyUnlockedChest.positionOnMap, LESSONS.length, newlyUnlockedChest.index);
          scrollToPosition(chestPos);
          say("chest_appeared");
          await delay(3000, signal);
        } else if (!isAllComplete) {
          await delay(3000, signal);
          setGlowingIndex(null);
        } else {
          await delay(1500, signal);
        }

        onUnlockAnimationDone?.();
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        throw e;
      }
    })();

    return () => controller.abort();
  }, [justCompletedLesson, justUnlockedLesson, sfx, say, openedChests, onUnlockAnimationDone, scrollToLesson, scrollToPosition, walkPikuTo]);

  const handleLockedTap = useCallback(() => {
    sfx("wrong-move");
  }, [sfx]);

  // ── Derived state ──────────────────────────────────────────────────
  const showOnboarding = firestoreReady && currentLesson === 0 && !onboardingDismissed && !justCompletedLesson;
  const showPiku = !showOnboarding;

  // Initial Piku position (for the ref-based element)
  const initialPos = allDone ? IGLOO_POSITION : getLessonPosition(currentLesson, LESSONS.length);

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
        {showPiku && (
          <div
            ref={pikuRef}
            className="absolute pointer-events-none"
            style={{
              left: pikuLeftCSS(initialPos, allDone),
              top: pikuTopCSS(initialPos),
            }}
          >
            <PikuWithOutfit
              expression={allDone ? "standing-celebrating" : "standing-happy"}
              headImage={equippedOutfit?.head}
              bodyImage={equippedOutfit?.body}
              cssSize={PIKU_CSS_SIZE}
            />
          </div>
        )}

        {/* First-time onboarding overlay — stays until player taps first lesson */}
        {showOnboarding && (() => {
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
