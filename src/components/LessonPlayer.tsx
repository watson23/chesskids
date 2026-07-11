"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Lesson } from "@/types/lesson";
import type { Square } from "@/types/chess";
import ChessBoard from "@/components/ChessBoard";
import StarDisplay from "@/components/StarDisplay";
import Confetti from "@/components/Confetti";
import SpeechBubble from "@/components/SpeechBubble";
import NarrationArea from "@/components/NarrationArea";
import NavIcon from "@/components/NavIcon";
import Piku from "@/components/Piku";
import FinalCelebration from "@/components/FinalCelebration";
import TapHint from "@/components/TapHint";
import { LESSONS } from "@/data/lessons";
import { useLessonPlayer } from "@/hooks/useLessonPlayer";
import { usePuzzleInteraction, applyPieceMove } from "@/hooks/usePuzzleInteraction";
import {
  NARRATION_DELAY,
  SUCCESS_DISPLAY_DURATION,
  BOARD_TRANSITION_DURATION,
  WATCH_ANIM_DELAY,
  WATCH_ANIM_AFTER_SPEECH,
  WATCH_TAP_FEEDBACK_DURATION,
  TAP_HINT_IDLE,
  WATCH_INDICATORS_LINGER,
} from "@/lib/timing";
import { useAudio } from "@/hooks/useAudio";
import { useActiveTheme } from "@/hooks/useActiveTheme";
import { useLocale } from "@/hooks/useLocale";
import { useAuth } from "@/hooks/useAuth";
import { getCheckSquareFromBoard } from "@/lib/chess-helpers";

interface LessonPlayerProps {
  lesson: Lesson;
}

export default function LessonPlayer({ lesson }: LessonPlayerProps) {
  const router = useRouter();
  const { say, sfx, stop } = useAudio();
  const { boardTheme, pieceColors } = useActiveTheme();
  const { t } = useLocale();
  const { activeChild } = useAuth();
  const {
    state,
    currentStep,
    currentPuzzle,
    advanceWatch,
    recordAttempt,
    progress,
    totalWatchSteps,
    totalPuzzles,
  } = useLessonPlayer(lesson);

  const interaction = usePuzzleInteraction({ sfx, say });
  const {
    selectedSquare,
    validMoves,
    correctMoveSquares,
    lastMove,
    boardPieces,
    wrongFlash,
    deniedSquare,
    narrationOverride,
    setBoardPieces,
    setLastMove,
    setValidMoves,
    resetBoard,
  } = interaction;

  // Red ring on a king in check after a move — works in watch demos
  // (check/checkmate lessons) and in try-phase puzzles alike
  const checkSquare = useMemo(() => {
    if (!lastMove) return null;
    const mover = boardPieces[lastMove.to];
    if (!mover) return null;
    return getCheckSquareFromBoard(boardPieces, mover.color);
  }, [boardPieces, lastMove]);

  const [showTapHint, setShowTapHint] = useState(false);
  // Bumped by the replay button in watch phase to re-run the whole step
  const [replayNonce, setReplayNonce] = useState(0);
  const [phaseOverride, setPhaseOverride] = useState<"watch" | "try" | "celebrate" | null>(null);
  const [boardTransition, setBoardTransition] = useState(false);
  const [watchTapFeedback, setWatchTapFeedback] = useState(false);
  const tapHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPhaseRef = useRef(state.phase);
  const narrationAbort = useRef<AbortController | null>(null);

  // Stop speech when leaving the lesson
  useEffect(() => () => stop(), [stop]);

  // Brief board fade on phase change (watch → try) + transition sound
  useEffect(() => {
    if (prevPhaseRef.current !== state.phase && state.phase !== "celebrate") {
      setBoardTransition(true);
      const timer = setTimeout(() => setBoardTransition(false), BOARD_TRANSITION_DURATION);
      // Sound cue when switching from watch → try
      if (state.phase === "try" && prevPhaseRef.current === "watch") {
        sfx("button-tap");
      }
      prevPhaseRef.current = state.phase;
      return () => clearTimeout(timer);
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, sfx]);

  // Watch phase: tap feedback — wobble + "watch first!" voice
  const handleWatchTap = useCallback(() => {
    if (watchTapFeedback) return; // debounce
    setWatchTapFeedback(true);
    say("watch_first");
    setTimeout(() => setWatchTapFeedback(false), WATCH_TAP_FEEDBACK_DURATION);
  }, [watchTapFeedback, say]);

  // 4-second idle timer during try phase — show tap hint
  useEffect(() => {
    if (tapHintTimer.current) clearTimeout(tapHintTimer.current);
    setShowTapHint(false);

    if (state.phase === "try" && !selectedSquare) {
      tapHintTimer.current = setTimeout(() => setShowTapHint(true), TAP_HINT_IDLE);
    }

    return () => { if (tapHintTimer.current) clearTimeout(tapHintTimer.current); };
  }, [state.phase, state.puzzleIndex, selectedSquare]);

  useEffect(() => {
    // Cancel any pending narration from the previous phase/step
    narrationAbort.current?.abort();
    const abort = new AbortController();
    narrationAbort.current = abort;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const delay = (ms: number, fn: () => void) => {
      const id = setTimeout(() => { if (!abort.signal.aborted) fn(); }, ms);
      timers.push(id);
    };

    if (state.phase === "watch" && currentStep) {
      resetBoard(currentStep.boardSetup);

      if (currentStep.animation?.highlights) {
        setValidMoves(currentStep.animation.highlights);
      }

      const anim = currentStep.animation;
      if (anim?.piece && anim.path?.length) {
        // Narrate, then move the piece — never mid-sentence. The move waits
        // for BOTH the narration to finish (+ a beat) and a minimum delay,
        // so it still paces sensibly when audio is off or TTS is silent.
        const from = anim.piece;
        const to = anim.path[anim.path.length - 1];
        delay(NARRATION_DELAY, async () => {
          const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
          const narrated = say(currentStep.narrationKey).then(() =>
            wait(WATCH_ANIM_AFTER_SPEECH)
          );
          await Promise.all([narrated, wait(WATCH_ANIM_DELAY - NARRATION_DELAY)]);
          if (abort.signal.aborted) return;
          setBoardPieces((prev) => applyPieceMove(prev, from, to));
          setLastMove({ from, to });
          // Clear the blue helper dots after a beat; the from/to move
          // highlight stays until the kid taps Next, so they can always
          // see what just happened.
          delay(WATCH_INDICATORS_LINGER, () => setValidMoves([]));
        });
      } else {
        delay(NARRATION_DELAY, () => say(currentStep.narrationKey));
      }
    } else if (state.phase === "try" && currentPuzzle) {
      resetBoard(currentPuzzle.boardSetup);
      delay(NARRATION_DELAY, () => say(currentPuzzle.narrationKey));
    } else if (state.phase === "celebrate") {
      delay(NARRATION_DELAY, () => {
        sfx("lesson-complete");
        const starKey =
          state.stars === 3
            ? "stars_3"
            : state.stars === 2
              ? "stars_2"
              : "stars_1";
        say(starKey);
      });
    }

    return () => { abort.abort(); timers.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.stepIndex, state.puzzleIndex, replayNonce]);

  const handleSquareTap = useCallback(
    (square: Square) => {
      const result = interaction.handleSquareTap(square, currentPuzzle, state.phase === "try");
      if (result === true) {
        // Correct move — show success narration briefly, then advance
        setPhaseOverride("celebrate");
        setTimeout(() => {
          setPhaseOverride(null);
          interaction.clearNarrationOverride();
          recordAttempt(true);
        }, SUCCESS_DISPLAY_DURATION);
      } else if (result === false) {
        recordAttempt(false);
      }
    },
    [interaction, currentPuzzle, state.phase, recordAttempt]
  );

  const handleReplay = useCallback(() => {
    if (state.phase === "watch" && currentStep) {
      // Re-run the whole step: board reset, narration, and the move animation
      setReplayNonce((n) => n + 1);
    } else if (state.phase === "try" && currentPuzzle) {
      say(currentPuzzle.narrationKey);
    }
  }, [state.phase, currentStep, currentPuzzle, say]);

  const handleNext = useCallback(() => { sfx("button-tap"); advanceWatch(); }, [sfx, advanceWatch]);
  const handleGoHome = useCallback(() => { sfx("button-tap"); router.push("/"); }, [sfx, router]);
  const handleContinue = useCallback(() => {
    sfx("button-tap");
    router.push(`/?completed=${encodeURIComponent(lesson.id)}&stars=${state.stars}`);
  }, [sfx, router, lesson.id, state.stars]);

  const isLastLesson = LESSONS[LESSONS.length - 1]?.id === lesson.id;

  const totalDots = totalWatchSteps + totalPuzzles;
  const currentDotIndex =
    state.phase === "watch"
      ? state.stepIndex
      : state.phase === "try"
        ? totalWatchSteps + state.puzzleIndex
        : totalDots;

  return (
    <div className="min-h-dvh flex flex-col overflow-y-auto" style={{ background: "var(--ck-bg) url(/game-bg.webp) center / cover no-repeat" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <NavIcon icon="icon-home" alt="Back to map" onClick={handleGoHome} />

        {/* Progress bar */}
        <div className="flex-1 mx-4">
          <div className="h-3.5 rounded-full overflow-hidden" style={{ background: "var(--ck-border)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(currentDotIndex / totalDots) * 100}%`, background: "var(--ck-purple)" }}
            />
          </div>
        </div>

        <div className="text-xs font-bold" style={{ color: "var(--ck-text-light)" }} aria-label={`Progress: ${Math.round(progress * 100)}%`}>
          {Math.round(progress * 100)}%
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-start pt-2 px-4 gap-3">
        {state.phase === "celebrate" ? (
          isLastLesson ? (
            <FinalCelebration stars={state.stars} onContinue={handleContinue} equippedOutfit={activeChild?.equippedOutfit} />
          ) : (
            <div className="flex flex-col items-center gap-6 animate-slide-in mt-auto mb-auto py-6">
              <Confetti active particleCount={60} />
              <SpeechBubble
                text={t(state.stars === 3 ? "celebrate_3_stars" : state.stars === 2 ? "celebrate_2_stars" : "celebrate_1_star")}
                visible
                pointer="bottom"
              />
              <Piku expression="standing-celebrating" size={160} />
              <StarDisplay stars={state.stars} size={56} staggerDelay={300} />
              <button onClick={handleContinue} className="mt-4 animate-bounce-gentle p-2 active:scale-90 transition-transform">
                <Image src="/icons/icon-check-circle.webp" alt={t("continue")} width={64} height={64} className="object-contain drop-shadow-lg" />
              </button>
            </div>
          )
        ) : (
          <>
            {/* Mascot + speech bubble narration area */}
            <NarrationArea
              narrationKey={
                narrationOverride
                  ? narrationOverride
                  : state.phase === "watch" && currentStep
                    ? currentStep.narrationKey
                    : state.phase === "try" && currentPuzzle
                      ? currentPuzzle.narrationKey
                      : ""
              }
              phase={
                phaseOverride ??
                (narrationOverride
                  ? narrationOverride === currentPuzzle?.successNarrationKey
                    ? "celebrate"
                    : "wrong"
                  : (state.phase as "watch" | "try"))
              }
              onReplay={handleReplay}
            />

            <div className={`relative w-full flex justify-center transition-all duration-500${boardTransition ? " opacity-0" : state.phase === "watch" ? " opacity-90" : " opacity-100"}${wrongFlash ? " animate-wrong-flash rounded-xl" : ""}${watchTapFeedback ? " animate-wobble" : ""}`}>
              <ChessBoard
                pieces={boardPieces}
                theme={boardTheme}
                pieceColors={pieceColors}
                selectedSquare={selectedSquare}
                validMoves={state.phase === "watch" ? [] : validMoves}
                correctMoves={correctMoveSquares}
                watchHighlights={state.phase === "watch" ? validMoves : []}
                checkSquare={checkSquare}
                deniedSquare={deniedSquare}
                lastMove={lastMove}
                onSquareTap={handleSquareTap}
                onWatchTap={state.phase === "watch" ? handleWatchTap : undefined}
                interactive={state.phase === "try"}
              />
              {state.phase === "watch" && (
                <div className="absolute inset-0 pointer-events-none rounded-xl border-4 border-blue-300/40 animate-pulse" />
              )}
            </div>

            {state.phase === "watch" && (
              <button onClick={handleNext} className="animate-bounce-gentle p-2 active:scale-90 transition-transform">
                <Image src="/icons/icon-next.webp" alt={t("next")} width={80} height={80} className="object-contain drop-shadow-lg" />
              </button>
            )}

            {state.phase === "try" && (
              <TapHint visible={showTapHint} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
