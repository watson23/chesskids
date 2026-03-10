"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { House, ArrowRight } from "@phosphor-icons/react";
import type { PuzzleDefinition } from "@/types/lesson";
import type { Square, ChessPiece } from "@/types/chess";
import ChessBoard from "@/components/ChessBoard";
import StarDisplay from "@/components/StarDisplay";
import Confetti from "@/components/Confetti";
import NarrationArea from "@/components/NarrationArea";
import Pikku from "@/components/Pikku";
import TapHint from "@/components/TapHint";
import { useAudio } from "@/hooks/useAudio";
import { useActiveTheme } from "@/hooks/useActiveTheme";
import { useLocale } from "@/hooks/useLocale";

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
  const { boardTheme, pieceColors } = useActiveTheme();
  const { t } = useLocale();

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
  const [showTapHint, setShowTapHint] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [narrationOverride, setNarrationOverride] = useState<string | null>(null);
  const tapHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPuzzle = useMemo(
    () => puzzles[puzzleIndex] ?? null,
    [puzzles, puzzleIndex]
  );

  // 4-second idle timer during solving phase — show tap hint
  useEffect(() => {
    if (tapHintTimer.current) clearTimeout(tapHintTimer.current);
    setShowTapHint(false);

    if (phase === "solving" && !selectedSquare) {
      tapHintTimer.current = setTimeout(() => setShowTapHint(true), 4000);
    }

    return () => { if (tapHintTimer.current) clearTimeout(tapHintTimer.current); };
  }, [phase, puzzleIndex, selectedSquare]);

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
          // Don't show destination hints for checkmate puzzles — let the child find the answer
          if (currentPuzzle.category !== "checkmate") {
            const destinations = correctMoves
              .filter((m) => m.from === square)
              .map((m) => m.to);
            setValidMoves(destinations);
          }
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

          // Promotion: pawn reaching back rank becomes queen
          const destRank = square[1];
          if (piece.type === "pawn" && (destRank === "8" || destRank === "1")) {
            newPieces[square] = { ...piece, type: "queen" };
          } else {
            newPieces[square] = piece;
          }

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
        }, 2500);
      } else {
        // Wrong move
        sfx("wrong-move");
        say(currentPuzzle.wrongMoveNarrationKey);
        setSelectedSquare(null);
        setValidMoves([]);
        setWrongFlash(true);
        setNarrationOverride("try_again");
        setTimeout(() => setWrongFlash(false), 600);
        setTimeout(() => setNarrationOverride(null), 2000);
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
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--ck-bg)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={handleGoHome}
          className="card-pillow p-2 active:scale-95 transition-transform"
          aria-label="Go back"
        >
          <House size={28} weight="fill" style={{ color: "var(--ck-purple)" }} />
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
          className="w-10 text-xs text-right font-semibold"
          style={{ color: "var(--ck-text-light)" }}
          aria-label={`Puzzle ${Math.min(puzzleIndex + 1, totalPuzzles)} of ${totalPuzzles}`}
        >
          {Math.min(puzzleIndex + 1, totalPuzzles)}/{totalPuzzles}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-start pt-2 px-4 gap-3">
        {phase === "celebrate" ? (
          <div className="flex flex-col items-center gap-5 animate-slide-in mt-auto mb-auto">
            <Confetti active />
            <Pikku expression="celebrating" size={64} />
            <h2 className="text-2xl font-extrabold" style={{ color: "var(--ck-text)" }}>
              {t(stars === 3 ? "celebrate_3_stars" : stars === 2 ? "celebrate_2_stars" : "celebrate_1_star")}
            </h2>
            <StarDisplay stars={stars} size={56} />
            <button
              onClick={handleContinue}
              className="btn-3d btn-3d-purple mt-2 px-8 py-3 text-white font-bold text-lg flex items-center gap-2"
            >
              {t("continue")}
              <ArrowRight size={24} weight="bold" />
            </button>
          </div>
        ) : (
          <>
            {/* Mascot + speech bubble narration area */}
            <NarrationArea
              narrationKey={
                narrationOverride
                  ? narrationOverride
                  : phase === "success" && currentPuzzle
                    ? currentPuzzle.successNarrationKey
                    : currentPuzzle
                      ? currentPuzzle.narrationKey
                      : ""
              }
              phase={narrationOverride === "try_again" ? "wrong" : narrationOverride ? "try" : phase === "success" ? "celebrate" : "try"}
            />

            <div className={`w-full flex justify-center${wrongFlash ? " animate-wrong-flash rounded-xl" : ""}`}>
              <ChessBoard
                pieces={boardPieces}
                theme={boardTheme}
                pieceColors={pieceColors}
                selectedSquare={selectedSquare}
                validMoves={validMoves}
                lastMove={lastMove}
                onSquareTap={handleSquareTap}
                interactive={phase === "solving"}
              />
            </div>

            {phase === "solving" && (
              <TapHint visible={showTapHint} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
