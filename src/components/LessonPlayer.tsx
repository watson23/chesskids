"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { House, ArrowRight } from "@phosphor-icons/react";
import type { Lesson } from "@/types/lesson";
import type { Square, ChessPiece } from "@/types/chess";
import ChessBoard from "@/components/ChessBoard";
import StarDisplay from "@/components/StarDisplay";
import Confetti from "@/components/Confetti";
import { useLessonPlayer } from "@/hooks/useLessonPlayer";
import { useAudio } from "@/hooks/useAudio";
import { DEFAULT_BOARD_THEME, DEFAULT_PIECE_COLORS } from "@/data/themes";

interface LessonPlayerProps {
  lesson: Lesson;
}

export default function LessonPlayer({ lesson }: LessonPlayerProps) {
  const router = useRouter();
  const { say, sfx } = useAudio();
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
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [boardPieces, setBoardPieces] = useState<Record<string, ChessPiece>>({});

  // Update board pieces when step or puzzle changes
  useEffect(() => {
    if (state.phase === "watch" && currentStep) {
      setBoardPieces(currentStep.boardSetup);
      setSelectedSquare(null);
      setValidMoves([]);
      setLastMove(null);
      say(currentStep.narrationKey);

      // Show highlights from animation if present
      if (currentStep.animation?.highlights) {
        setValidMoves(currentStep.animation.highlights);
      }
    } else if (state.phase === "try" && currentPuzzle) {
      setBoardPieces(currentPuzzle.boardSetup);
      setSelectedSquare(null);
      setValidMoves([]);
      setLastMove(null);
      say(currentPuzzle.narrationKey);
    } else if (state.phase === "celebrate") {
      sfx("lesson-complete");
      const starKey =
        state.stars === 3
          ? "stars_3"
          : state.stars === 2
            ? "stars_2"
            : "stars_1";
      say(starKey);
    }
    // We only want this to run when the phase/index changes, not on every say/sfx ref change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.stepIndex, state.puzzleIndex]);

  const handleSquareTap = useCallback(
    (square: Square) => {
      if (state.phase !== "try" || !currentPuzzle) return;

      const correctMoves = currentPuzzle.correctMoves;

      // If no piece is selected yet
      if (selectedSquare === null) {
        // Check if this square is a valid source for any correct move
        const isValidSource = correctMoves.some((m) => m.from === square);
        const piece = boardPieces[square];

        if (isValidSource && piece) {
          setSelectedSquare(square);
          sfx("piece-pickup");
          // Show valid destinations for this source
          const destinations = correctMoves
            .filter((m) => m.from === square)
            .map((m) => m.to);
          setValidMoves(destinations);
        }
        // If they tap a wrong piece, do nothing (no penalty)
        return;
      }

      // A piece is already selected
      if (square === selectedSquare) {
        // Deselect
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      // Check if the move is in correctMoves
      const isCorrect = correctMoves.some(
        (m) => m.from === selectedSquare && m.to === square
      );

      if (isCorrect) {
        // Move the piece visually
        const piece = boardPieces[selectedSquare];
        if (piece) {
          const newPieces = { ...boardPieces };
          delete newPieces[selectedSquare];
          newPieces[square] = piece;
          setBoardPieces(newPieces);
        }
        setLastMove({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        setValidMoves([]);
        sfx("piece-place");
        say(currentPuzzle.successNarrationKey);
        // Small delay before advancing so the child sees the move
        setTimeout(() => {
          recordAttempt(true);
        }, 800);
      } else {
        // Wrong destination
        sfx("wrong-move");
        say(currentPuzzle.wrongMoveNarrationKey);
        setSelectedSquare(null);
        setValidMoves([]);
        recordAttempt(false);
      }
    },
    [state.phase, currentPuzzle, selectedSquare, boardPieces, sfx, say, recordAttempt]
  );

  const handleNext = useCallback(() => {
    sfx("button-tap");
    advanceWatch();
  }, [sfx, advanceWatch]);

  const handleGoHome = useCallback(() => {
    sfx("button-tap");
    router.push("/");
  }, [sfx, router]);

  const handleContinue = useCallback(() => {
    sfx("button-tap");
    router.push("/");
  }, [sfx, router]);

  // Progress dots
  const totalDots = totalWatchSteps + totalPuzzles;
  const currentDotIndex =
    state.phase === "watch"
      ? state.stepIndex
      : state.phase === "try"
        ? totalWatchSteps + state.puzzleIndex
        : totalDots;

  return (
    <div className="min-h-dvh flex flex-col bg-amber-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={handleGoHome}
          className="p-2 rounded-full bg-white/80 shadow-sm active:scale-95 transition-transform"
          aria-label="Go home"
        >
          <House size={28} weight="fill" className="text-amber-700" />
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5 items-center">
          {Array.from({ length: totalDots }, (_, i) => {
            const isCompleted = i < currentDotIndex;
            const isCurrent = i === currentDotIndex;
            const isPuzzleDot = i >= totalWatchSteps;
            return (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  isCompleted
                    ? "bg-green-400 w-2.5 h-2.5"
                    : isCurrent
                      ? "bg-amber-400 w-3 h-3 animate-pulse"
                      : isPuzzleDot
                        ? "bg-amber-200 w-2 h-2"
                        : "bg-gray-300 w-2 h-2"
                }`}
              />
            );
          })}
        </div>

        {/* Progress percentage (accessibility) */}
        <div className="w-10 text-xs text-amber-600 text-right font-semibold" aria-label={`Progress: ${Math.round(progress * 100)}%`}>
          {Math.round(progress * 100)}%
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
        {state.phase === "celebrate" ? (
          /* Celebrate phase */
          <div className="flex flex-col items-center gap-6 animate-slide-in">
            <Confetti active />
            <h2 className="text-2xl font-extrabold text-amber-800">
              {state.stars === 3 ? "Amazing!" : state.stars === 2 ? "Great job!" : "Good try!"}
            </h2>
            <StarDisplay stars={state.stars} size={56} />
            <button
              onClick={handleContinue}
              className="mt-4 px-8 py-3 bg-green-500 text-white font-bold text-lg rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              Continue
            </button>
          </div>
        ) : (
          /* Watch or Try phase */
          <>
            <ChessBoard
              pieces={boardPieces}
              theme={DEFAULT_BOARD_THEME}
              pieceColors={DEFAULT_PIECE_COLORS}
              selectedSquare={selectedSquare}
              validMoves={validMoves}
              lastMove={lastMove}
              onSquareTap={handleSquareTap}
              interactive={state.phase === "try"}
            />

            {/* Watch phase: Next button */}
            {state.phase === "watch" && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white font-bold text-lg rounded-2xl shadow-lg active:scale-95 transition-transform animate-slide-in"
              >
                Next
                <ArrowRight size={24} weight="bold" />
              </button>
            )}

            {/* Try phase: instruction */}
            {state.phase === "try" && (
              <p className="text-amber-700 font-semibold text-center animate-slide-in">
                Your turn! Tap a piece and then its destination.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
