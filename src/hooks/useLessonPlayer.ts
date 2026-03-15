"use client";

import { useState, useCallback, useMemo } from "react";
import type { Lesson } from "@/types/lesson";
import type { LessonPhase } from "@/types/lesson";
import { calculateStars } from "@/lib/scoring";

export interface LessonPlayerState {
  phase: LessonPhase;
  stepIndex: number;
  puzzleIndex: number;
  attempts: number;
  stars: number;
}

export function useLessonPlayer(lesson: Lesson) {
  const [state, setState] = useState<LessonPlayerState>({
    phase: "watch",
    stepIndex: 0,
    puzzleIndex: 0,
    attempts: 0,
    stars: 0,
  });

  const totalWatchSteps = lesson.steps.length;
  const totalPuzzles = lesson.puzzles.length;

  const currentStep = useMemo(() => {
    if (state.phase === "watch") {
      return lesson.steps[state.stepIndex] ?? null;
    }
    return null;
  }, [lesson.steps, state.phase, state.stepIndex]);

  const currentPuzzle = useMemo(() => {
    if (state.phase === "try") {
      return lesson.puzzles[state.puzzleIndex] ?? null;
    }
    return null;
  }, [lesson.puzzles, state.phase, state.puzzleIndex]);

  const advanceWatch = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.stepIndex + 1;
      if (nextIndex < totalWatchSteps) {
        return { ...prev, stepIndex: nextIndex };
      }
      // All watch steps done
      if (totalPuzzles === 0) {
        // No puzzles — go straight to celebrate with 3 stars
        return { ...prev, phase: "celebrate" as LessonPhase, stars: 3 };
      }
      return {
        ...prev,
        phase: "try" as LessonPhase,
        stepIndex: prev.stepIndex,
        puzzleIndex: 0,
      };
    });
  }, [totalWatchSteps, totalPuzzles]);

  const recordAttempt = useCallback(
    (correct: boolean) => {
      setState((prev) => {
        if (!correct) {
          return { ...prev, attempts: prev.attempts + 1 };
        }
        // Correct answer
        const nextPuzzle = prev.puzzleIndex + 1;
        if (nextPuzzle < totalPuzzles) {
          return { ...prev, puzzleIndex: nextPuzzle };
        }
        // All puzzles done, celebrate
        const stars = calculateStars(prev.attempts);
        return {
          ...prev,
          phase: "celebrate" as LessonPhase,
          stars,
        };
      });
    },
    [totalPuzzles]
  );

  const reset = useCallback(() => {
    setState({
      phase: "watch",
      stepIndex: 0,
      puzzleIndex: 0,
      attempts: 0,
      stars: 0,
    });
  }, []);

  const progress = useMemo(() => {
    const total = totalWatchSteps + totalPuzzles;
    if (state.phase === "watch") {
      return state.stepIndex / total;
    }
    if (state.phase === "try") {
      return (totalWatchSteps + state.puzzleIndex) / total;
    }
    return 1;
  }, [state.phase, state.stepIndex, state.puzzleIndex, totalWatchSteps, totalPuzzles]);

  return {
    state,
    currentStep,
    currentPuzzle,
    advanceWatch,
    recordAttempt,
    reset,
    progress,
    totalWatchSteps,
    totalPuzzles,
  };
}
