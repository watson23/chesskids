"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import NavIcon from "@/components/NavIcon";
import type { PuzzleDefinition } from "@/types/lesson";
import type { Square, ChessPiece } from "@/types/chess";
import { getLegalMovesFromBoard } from "@/lib/chess-helpers";
import type { LocaleKey } from "@/types/locale";
import type { PuzzleProgress } from "@/types/user";
import ChessBoard from "@/components/ChessBoard";
import StarDisplay from "@/components/StarDisplay";
import Confetti from "@/components/Confetti";
import NarrationArea from "@/components/NarrationArea";
import Piku from "@/components/Piku";
import TapHint from "@/components/TapHint";
import { useAudio } from "@/hooks/useAudio";
import { useActiveTheme } from "@/hooks/useActiveTheme";
import { useLocale } from "@/hooks/useLocale";
import { calculateStars } from "@/lib/scoring";
import { markPuzzleSolved } from "@/lib/firestore";

interface PuzzlePlayerProps {
  puzzles: PuzzleDefinition[];
  onComplete: () => void;
  uid?: string;
  childId?: string;
  /** Solved status per puzzle ID — enables teal star nav + jump-to-puzzle */
  puzzleProgress?: Record<string, PuzzleProgress>;
  /** Called after a puzzle is solved so parent can refresh progress */
  onPuzzleSolved?: () => void;
}

type Phase = "solving" | "success" | "celebrate";

/** Teal star for the puzzle nav bar */
function TealStar({ filled, active, size = 24 }: { filled: boolean; active: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"
        fill={filled ? "#2DD4BF" : "none"}
        stroke={active ? "#14B8A6" : filled ? "#14B8A6" : "#99F6E4"}
        strokeWidth={active ? "2.5" : "1.5"}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PuzzlePlayer({
  puzzles,
  onComplete,
  uid,
  childId,
  puzzleProgress,
  onPuzzleSolved,
}: PuzzlePlayerProps) {
  const { say, sfx, stop } = useAudio();
  const { boardTheme, pieceColors } = useActiveTheme();
  const { t } = useLocale();

  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [phase, setPhase] = useState<Phase>("solving");
  const [stars, setStars] = useState(0);
  // Track puzzles solved in this session (for immediate star fill before Firestore roundtrip)
  const [solvedInSession, setSolvedInSession] = useState<Set<string>>(new Set());

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [correctMoveSquares, setCorrectMoveSquares] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [boardPieces, setBoardPieces] = useState<Record<string, ChessPiece>>(
    {}
  );
  const [showTapHint, setShowTapHint] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [narrationOverride, setNarrationOverride] = useState<LocaleKey | null>(null);
  const tapHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPuzzle = useMemo(
    () => puzzles[puzzleIndex] ?? null,
    [puzzles, puzzleIndex]
  );

  const hasTealStars = puzzleProgress !== undefined;

  // Stop speech when leaving the puzzle
  useEffect(() => () => stop(), [stop]);

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
    let cancelled = false;
    if (phase === "solving" && currentPuzzle) {
      setBoardPieces(currentPuzzle.boardSetup);
      setSelectedSquare(null);
      setValidMoves([]);
      setLastMove(null);
      const timer = setTimeout(() => {
        if (!cancelled) say(currentPuzzle.narrationKey);
      }, 300);
      return () => { cancelled = true; clearTimeout(timer); };
    } else if (phase === "celebrate") {
      const timer = setTimeout(() => {
        if (!cancelled) {
          sfx("lesson-complete");
          const starKey =
            stars === 3 ? "stars_3" : stars === 2 ? "stars_2" : "stars_1";
          say(starKey);
        }
      }, 300);
      return () => { cancelled = true; clearTimeout(timer); };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, puzzleIndex]);

  /** Jump to a specific puzzle by index */
  const jumpToPuzzle = useCallback(
    (index: number) => {
      if (index === puzzleIndex || phase === "success") return;
      sfx("button-tap");
      setPuzzleIndex(index);
      setPhase("solving");
      setSelectedSquare(null);
      setValidMoves([]);
      setLastMove(null);
      setWrongAttempts(0);
      setNarrationOverride(null);
    },
    [puzzleIndex, phase, sfx]
  );

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
          // Show all legal moves as subtle dots, correct moves as golden
          const allLegal = getLegalMovesFromBoard(boardPieces, square, piece.color);
          const correctDestinations = correctMoves.filter((m) => m.from === square).map((m) => m.to);
          setValidMoves(allLegal);
          setCorrectMoveSquares(correctDestinations);
        }
        return;
      }

      // A piece is already selected
      if (square === selectedSquare) {
        setSelectedSquare(null);
        setValidMoves([]);
        setCorrectMoveSquares([]);
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

        // Save puzzle progress to Firestore
        if (uid && childId) markPuzzleSolved(uid, childId, currentPuzzle.id);
        // Track in session for immediate star fill
        setSolvedInSession((prev) => new Set(prev).add(currentPuzzle.id));
        // Notify parent to refresh progress
        onPuzzleSolved?.();

        // Show success briefly, then advance to next unsolved (or stay)
        setPhase("success");
        setTimeout(() => {
          if (hasTealStars) {
            // Auto-advance to next unsolved puzzle
            // Use fresh solvedInSession since we just added current puzzle above
            const newSolved = new Set(solvedInSession);
            newSolved.add(currentPuzzle.id);
            const nextUnsolved = puzzles.findIndex((p, i) =>
              i > puzzleIndex &&
              !(puzzleProgress?.[p.id]?.solved ?? false) &&
              !newSolved.has(p.id)
            );
            if (nextUnsolved !== -1) {
              setPuzzleIndex(nextUnsolved);
            }
            setPhase("solving");
          } else {
            const nextIndex = puzzleIndex + 1;
            if (nextIndex < puzzles.length) {
              setPuzzleIndex(nextIndex);
              setPhase("solving");
            } else {
              // All puzzles done (lesson mode)
              const earnedStars = calculateStars(wrongAttempts);
              setStars(earnedStars);
              setPhase("celebrate");
            }
          }
        }, 2500);
      } else {
        // Wrong move
        sfx("wrong-move");
        say(currentPuzzle.wrongMoveNarrationKey);
        setSelectedSquare(null);
        setValidMoves([]);
        setCorrectMoveSquares([]);
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
      onComplete,
      onPuzzleSolved,
      hasTealStars,
      uid,
      childId,
      solvedInSession,
      puzzleProgress,
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

  const totalPuzzles = puzzles.length;

  /** Check if a puzzle is solved (from Firestore progress OR solved in this session) */
  const isPuzzleSolved = useCallback(
    (puzzle: PuzzleDefinition) => {
      return (puzzleProgress?.[puzzle.id]?.solved ?? false) || solvedInSession.has(puzzle.id);
    },
    [puzzleProgress, solvedInSession]
  );

  return (
    <div className="min-h-dvh flex flex-col overflow-y-auto" style={{ background: "var(--ck-bg) url(/game-bg.webp) center / cover no-repeat" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <NavIcon icon="icon-back" alt="Back" onClick={handleGoHome} />

        {/* Teal star navigation (practice mode) or progress dots (lesson mode) */}
        {hasTealStars ? (
          <div className="flex gap-1 items-center">
            {puzzles.map((puzzle, i) => {
              const isCurrent = i === puzzleIndex && phase !== "celebrate";
              const isSolved = isPuzzleSolved(puzzle);
              return (
                <button
                  key={puzzle.id}
                  onClick={() => jumpToPuzzle(i)}
                  className={`transition-transform ${isCurrent ? "scale-125" : "hover:scale-110"}`}
                  aria-label={`Puzzle ${i + 1}${isSolved ? ", solved" : ""}${isCurrent ? ", current" : ""}`}
                >
                  <TealStar filled={isSolved} active={isCurrent} size={isCurrent ? 28 : 22} />
                </button>
              );
            })}
          </div>
        ) : totalPuzzles > 1 ? (
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
        ) : null}

        {/* Spacer to balance back button */}
        <div className="w-10" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-start pt-2 px-4 gap-3">
        {phase === "celebrate" ? (
          <div className="flex flex-col items-center gap-5 animate-slide-in mt-auto mb-auto">
            <Confetti active />
            <Piku expression="celebrating" size={120} />
            <h2 className="text-2xl font-extrabold" style={{ color: "var(--ck-text)" }}>
              {t(stars === 3 ? "celebrate_3_stars" : stars === 2 ? "celebrate_2_stars" : "celebrate_1_star")}
            </h2>
            <StarDisplay stars={stars} size={56} />
            <button onClick={handleContinue} className="mt-2 animate-bounce-gentle p-2 active:scale-90 transition-transform">
              <Image src="/icons/icon-check-circle.webp" alt={t("continue")} width={64} height={64} className="object-contain drop-shadow-lg" />
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
                correctMoves={correctMoveSquares}
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
