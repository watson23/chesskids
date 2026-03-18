"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Lesson } from "@/types/lesson";
import type { Square, ChessPiece } from "@/types/chess";
import { getLegalMovesFromBoard } from "@/lib/chess-helpers";
import type { LocaleKey } from "@/types/locale";
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
import { useAudio } from "@/hooks/useAudio";
import { useActiveTheme } from "@/hooks/useActiveTheme";
import { useLocale } from "@/hooks/useLocale";
import { useAuth } from "@/hooks/useAuth";

interface LessonPlayerProps {
  lesson: Lesson;
}

export default function LessonPlayer({ lesson }: LessonPlayerProps) {
  const router = useRouter();
  const { say, sfx } = useAudio();
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

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [correctMoveSquares, setCorrectMoveSquares] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [boardPieces, setBoardPieces] = useState<Record<string, ChessPiece>>({});
  const [showTapHint, setShowTapHint] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [narrationOverride, setNarrationOverride] = useState<LocaleKey | null>(null);
  const [phaseOverride, setPhaseOverride] = useState<"watch" | "try" | "celebrate" | null>(null);
  const [boardTransition, setBoardTransition] = useState(false);
  const [watchTapFeedback, setWatchTapFeedback] = useState(false);
  const tapHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPhaseRef = useRef(state.phase);

  // Brief board fade on phase change (watch → try) + transition sound
  useEffect(() => {
    if (prevPhaseRef.current !== state.phase && state.phase !== "celebrate") {
      setBoardTransition(true);
      const timer = setTimeout(() => setBoardTransition(false), 300);
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
    setTimeout(() => setWatchTapFeedback(false), 2000);
  }, [watchTapFeedback, say]);

  // 4-second idle timer during try phase — show tap hint
  useEffect(() => {
    if (tapHintTimer.current) clearTimeout(tapHintTimer.current);
    setShowTapHint(false);

    if (state.phase === "try" && !selectedSquare) {
      tapHintTimer.current = setTimeout(() => setShowTapHint(true), 4000);
    }

    return () => { if (tapHintTimer.current) clearTimeout(tapHintTimer.current); };
  }, [state.phase, state.puzzleIndex, selectedSquare]);

  useEffect(() => {
    let cancelled = false;

    if (state.phase === "watch" && currentStep) {
      setBoardPieces(currentStep.boardSetup);
      setSelectedSquare(null);
      setValidMoves([]);
      setLastMove(null);

      if (currentStep.animation?.highlights) {
        setValidMoves(currentStep.animation.highlights);
      }

      const timer = setTimeout(() => {
        if (!cancelled) say(currentStep.narrationKey);
      }, 50);

      // Auto-animate piece movement after a delay (e.g. castling, checkmate demos)
      let animTimer: ReturnType<typeof setTimeout> | null = null;
      let clearTimer: ReturnType<typeof setTimeout> | null = null;
      if (currentStep.animation?.piece && currentStep.animation?.path?.length) {
        animTimer = setTimeout(() => {
          if (cancelled) return;
          const anim = currentStep.animation!;
          const from = anim.piece;
          const to = anim.path[anim.path.length - 1];
          setBoardPieces((prev) => {
            const newPieces = { ...prev };
            const piece = newPieces[from];
            if (piece) {
              delete newPieces[from];
              newPieces[to] = piece;
              // Castling: if king moves 2 squares, also move the rook
              if (piece.type === "king") {
                const fromFile = from.charCodeAt(0);
                const toFile = to.charCodeAt(0);
                const rank = to[1];
                if (toFile - fromFile === 2) {
                  const rookFrom = `h${rank}` as Square;
                  const rookTo = `f${rank}` as Square;
                  if (newPieces[rookFrom]) {
                    newPieces[rookTo] = newPieces[rookFrom];
                    delete newPieces[rookFrom];
                  }
                } else if (fromFile - toFile === 2) {
                  const rookFrom = `a${rank}` as Square;
                  const rookTo = `d${rank}` as Square;
                  if (newPieces[rookFrom]) {
                    newPieces[rookTo] = newPieces[rookFrom];
                    delete newPieces[rookFrom];
                  }
                }
              }
            }
            return newPieces;
          });
          setLastMove({ from, to });
          // Clear all indicators after a brief pause so the board is clean
          clearTimer = setTimeout(() => {
            if (cancelled) return;
            setValidMoves([]);
            setLastMove(null);
          }, 1500);
        }, 1200);
      }

      return () => { cancelled = true; clearTimeout(timer); if (animTimer) clearTimeout(animTimer); if (clearTimer) clearTimeout(clearTimer); };
    } else if (state.phase === "try" && currentPuzzle) {
      setBoardPieces(currentPuzzle.boardSetup);
      setSelectedSquare(null);
      setValidMoves([]);
      setLastMove(null);

      const timer = setTimeout(() => {
        if (!cancelled) say(currentPuzzle.narrationKey);
      }, 50);
      return () => { cancelled = true; clearTimeout(timer); };
    } else if (state.phase === "celebrate") {
      const timer = setTimeout(() => {
        if (!cancelled) {
          sfx("lesson-complete");
          const starKey =
            state.stars === 3
              ? "stars_3"
              : state.stars === 2
                ? "stars_2"
                : "stars_1";
          say(starKey);
        }
      }, 50);
      return () => { cancelled = true; clearTimeout(timer); };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.stepIndex, state.puzzleIndex]);

  const handleSquareTap = useCallback(
    (square: Square) => {
      if (state.phase !== "try" || !currentPuzzle) return;
      const correctMoves = currentPuzzle.correctMoves;

      if (selectedSquare === null) {
        const isValidSource = correctMoves.some((m) => m.from === square);
        const piece = boardPieces[square];
        if (isValidSource && piece) {
          setSelectedSquare(square);
          sfx("piece-pickup");
          // Show all legal moves as subtle dots, correct moves as golden
          const allLegal = getLegalMovesFromBoard(boardPieces, square, piece.color);
          const correctDestinations = correctMoves.filter((m) => m.from === square).map((m) => m.to);
          setValidMoves(allLegal);
          setCorrectMoveSquares(correctDestinations);
        }
        return;
      }

      if (square === selectedSquare) {
        setSelectedSquare(null);
        setValidMoves([]);
        setCorrectMoveSquares([]);
        return;
      }

      const isCorrect = correctMoves.some((m) => m.from === selectedSquare && m.to === square);
      if (isCorrect) {
        const piece = boardPieces[selectedSquare];
        if (piece) {
          const newPieces = { ...boardPieces };
          delete newPieces[selectedSquare];

          // Promotion: pawn reaching back rank becomes queen
          const destRank = square[1];
          if (piece.type === "pawn" && (destRank === "8" || destRank === "1")) {
            newPieces[square] = { ...piece, type: "queen" };
          } else {
            newPieces[square] = piece;
          }

          // Castling: king moves 2 squares → also move the rook
          if (piece.type === "king") {
            const fromFile = selectedSquare.charCodeAt(0);
            const toFile = square.charCodeAt(0);
            const rank = square[1];
            if (toFile - fromFile === 2) {
              // Kingside castle
              const rookFrom = `h${rank}` as Square;
              const rookTo = `f${rank}` as Square;
              if (newPieces[rookFrom]) {
                newPieces[rookTo] = newPieces[rookFrom];
                delete newPieces[rookFrom];
              }
            } else if (fromFile - toFile === 2) {
              // Queenside castle
              const rookFrom = `a${rank}` as Square;
              const rookTo = `d${rank}` as Square;
              if (newPieces[rookFrom]) {
                newPieces[rookTo] = newPieces[rookFrom];
                delete newPieces[rookFrom];
              }
            }
          }

          // En passant: pawn captures diagonally to empty square → remove captured pawn
          if (piece.type === "pawn") {
            const fromFile = selectedSquare[0];
            const toFile = square[0];
            if (fromFile !== toFile && !boardPieces[square]) {
              // Diagonal move to empty square = en passant
              const capturedSquare = `${toFile}${selectedSquare[1]}` as Square;
              delete newPieces[capturedSquare];
            }
          }

          setBoardPieces(newPieces);
        }
        setLastMove({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        setValidMoves([]);
        setCorrectMoveSquares([]);
        sfx("piece-place");
        say(currentPuzzle.successNarrationKey);
        setNarrationOverride(currentPuzzle.successNarrationKey);
        setPhaseOverride("celebrate");
        setTimeout(() => {
          setNarrationOverride(null);
          setPhaseOverride(null);
          recordAttempt(true);
        }, 2500);
      } else {
        sfx("wrong-move");
        say(currentPuzzle.wrongMoveNarrationKey);
        setSelectedSquare(null);
        setValidMoves([]);
        setCorrectMoveSquares([]);
        setWrongFlash(true);
        setNarrationOverride("try_again");
        setTimeout(() => setWrongFlash(false), 600);
        setTimeout(() => setNarrationOverride(null), 2000);
        recordAttempt(false);
      }
    },
    [state.phase, currentPuzzle, selectedSquare, boardPieces, sfx, say, recordAttempt]
  );

  const handleReplay = useCallback(() => {
    if (state.phase === "watch" && currentStep) {
      say(currentStep.narrationKey);
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
              phase={phaseOverride ?? (narrationOverride === "try_again" ? "wrong" : narrationOverride ? "try" : (state.phase as "watch" | "try"))}
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
