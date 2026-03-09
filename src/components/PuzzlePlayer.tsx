"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { House, ArrowRight } from "@phosphor-icons/react";
import type { PuzzleDefinition } from "@/types/lesson";
import type { Square, ChessPiece } from "@/types/chess";
import ChessBoard from "@/components/ChessBoard";
import StarDisplay from "@/components/StarDisplay";
import Confetti from "@/components/Confetti";
import { useAudio } from "@/hooks/useAudio";
import { DEFAULT_BOARD_THEME, DEFAULT_PIECE_COLORS } from "@/data/themes";

interface PuzzlePlayerProps {
  puzzles: PuzzleDefinition[];
  onComplete: () => void;
}

function calculateStars(wrongAttempts: number): number {
  if (wrongAttempts === 0) return 3;
  if (wrongAttempts <= 2) return 2;
  return 1;
}

type Phase = "solving" | "success" | "celebrate";

export default function PuzzlePlayer({
  puzzles,
  onComplete,
}: PuzzlePlayerProps) {
  const { say, sfx } = useAudio();

  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [phase, setPhase] = useState<Phase>("solving");
  const [stars, setStars] = useState(0);

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [boardPieces, setBoardPieces] = useState<Record<string, ChessPiece>>(
    {}
  );

  const currentPuzzle = useMemo(
    () => puzzles[puzzleIndex] ?? null,
    [puzzles, puzzleIndex]
  );

  // Set up board when puzzle changes
  useEffect(() => {
    if (phase === "solving" && currentPuzzle) {
      setBoardPieces(currentPuzzle.boardSetup);
      setSelectedSquare(null);
      setValidMoves([]);
      setLastMove(null);
      say(currentPuzzle.narrationKey);
    } else if (phase === "celebrate") {
      sfx("lesson-complete");
      const starKey =
        stars === 3 ? "stars_3" : stars === 2 ? "stars_2" : "stars_1";
      say(starKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, puzzleIndex]);

  const handleSquareTap = useCallback(
    (square: Square) => {
      if (phase !== "solving" || !currentPuzzle) return;

      const correctMoves = currentPuzzle.correctMoves;

      // If no piece is selected yet
      if (selectedSquare === null) {
        const isValidSource = correctMoves.some((m) => m.from === square);
        const piece = boardPieces[square];

        if (isValidSource && piece) {
          setSelectedSquare(square);
          sfx("piece-pickup");
          const destinations = correctMoves
            .filter((m) => m.from === square)
            .map((m) => m.to);
          setValidMoves(destinations);
        }
        return;
      }

      // A piece is already selected
      if (square === selectedSquare) {
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      // Check if the move is correct
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

        // Show success briefly, then advance
        setPhase("success");
        setTimeout(() => {
          const nextIndex = puzzleIndex + 1;
          if (nextIndex < puzzles.length) {
            setPuzzleIndex(nextIndex);
            setPhase("solving");
          } else {
            // All puzzles done
            const earnedStars = calculateStars(wrongAttempts);
            setStars(earnedStars);
            setPhase("celebrate");
          }
        }, 1200);
      } else {
        // Wrong move
        sfx("wrong-move");
        say(currentPuzzle.wrongMoveNarrationKey);
        setSelectedSquare(null);
        setValidMoves([]);
        setWrongAttempts((prev) => prev + 1);
      }
    },
    [
      phase,
      currentPuzzle,
      selectedSquare,
      boardPieces,
      sfx,
      say,
      puzzleIndex,
      puzzles.length,
      wrongAttempts,
    ]
  );

  const handleGoHome = useCallback(() => {
    sfx("button-tap");
    onComplete();
  }, [sfx, onComplete]);

  const handleContinue = useCallback(() => {
    sfx("button-tap");
    onComplete();
  }, [sfx, onComplete]);

  // Progress dots
  const totalPuzzles = puzzles.length;

  return (
    <div className="min-h-dvh flex flex-col bg-amber-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={handleGoHome}
          className="p-2 rounded-full bg-white/80 shadow-sm active:scale-95 transition-transform"
          aria-label="Go back"
        >
          <House size={28} weight="fill" className="text-amber-700" />
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5 items-center">
          {Array.from({ length: totalPuzzles }, (_, i) => {
            const isCompleted = i < puzzleIndex;
            const isCurrent =
              i === puzzleIndex && phase !== "celebrate";
            return (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  isCompleted
                    ? "bg-green-400 w-2.5 h-2.5"
                    : isCurrent
                      ? "bg-amber-400 w-3 h-3 animate-pulse"
                      : "bg-gray-300 w-2 h-2"
                }`}
              />
            );
          })}
        </div>

        {/* Puzzle count */}
        <div
          className="w-10 text-xs text-amber-600 text-right font-semibold"
          aria-label={`Puzzle ${Math.min(puzzleIndex + 1, totalPuzzles)} of ${totalPuzzles}`}
        >
          {Math.min(puzzleIndex + 1, totalPuzzles)}/{totalPuzzles}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
        {phase === "celebrate" ? (
          <div className="flex flex-col items-center gap-6 animate-slide-in">
            <Confetti active />
            <h2 className="text-2xl font-extrabold text-amber-800">
              {stars === 3
                ? "Amazing!"
                : stars === 2
                  ? "Great job!"
                  : "Good try!"}
            </h2>
            <StarDisplay stars={stars} size={56} />
            <button
              onClick={handleContinue}
              className="mt-4 px-8 py-3 bg-green-500 text-white font-bold text-lg rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center gap-2"
            >
              Continue
              <ArrowRight size={24} weight="bold" />
            </button>
          </div>
        ) : (
          <>
            <ChessBoard
              pieces={boardPieces}
              theme={DEFAULT_BOARD_THEME}
              pieceColors={DEFAULT_PIECE_COLORS}
              selectedSquare={selectedSquare}
              validMoves={validMoves}
              lastMove={lastMove}
              onSquareTap={handleSquareTap}
              interactive={phase === "solving"}
            />

            {/* Success feedback */}
            {phase === "success" && (
              <div className="flex items-center gap-2 animate-slide-in">
                <span className="text-3xl">&#11088;</span>
                <p className="text-green-600 font-bold text-lg">
                  Correct!
                </p>
              </div>
            )}

            {/* Solving instruction */}
            {phase === "solving" && (
              <p className="text-amber-700 font-semibold text-center animate-slide-in">
                Tap a piece and then its destination.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
