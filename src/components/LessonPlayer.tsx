"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { House, ArrowRight } from "@phosphor-icons/react";
import type { Lesson } from "@/types/lesson";
import type { Square, ChessPiece } from "@/types/chess";
import ChessBoard from "@/components/ChessBoard";
import StarDisplay from "@/components/StarDisplay";
import Confetti from "@/components/Confetti";
import NarrationArea from "@/components/NarrationArea";
import Pikku from "@/components/Pikku";
import TapHint from "@/components/TapHint";
import { useLessonPlayer } from "@/hooks/useLessonPlayer";
import { useAudio } from "@/hooks/useAudio";
import { useActiveTheme } from "@/hooks/useActiveTheme";
import { useLocale } from "@/hooks/useLocale";

interface LessonPlayerProps {
  lesson: Lesson;
}

export default function LessonPlayer({ lesson }: LessonPlayerProps) {
  const router = useRouter();
  const { say, sfx } = useAudio();
  const { boardTheme, pieceColors } = useActiveTheme();
  const { t } = useLocale();
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
  const [showTapHint, setShowTapHint] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [narrationOverride, setNarrationOverride] = useState<string | null>(null);
  const [phaseOverride, setPhaseOverride] = useState<"watch" | "try" | "celebrate" | null>(null);
  const tapHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      return () => { cancelled = true; clearTimeout(timer); };
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
          const destinations = correctMoves.filter((m) => m.from === square).map((m) => m.to);
          setValidMoves(destinations);
        }
        return;
      }

      if (square === selectedSquare) {
        setSelectedSquare(null);
        setValidMoves([]);
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

          setBoardPieces(newPieces);
        }
        setLastMove({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        setValidMoves([]);
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
        setWrongFlash(true);
        setNarrationOverride("try_again");
        setTimeout(() => setWrongFlash(false), 600);
        setTimeout(() => setNarrationOverride(null), 2000);
        recordAttempt(false);
      }
    },
    [state.phase, currentPuzzle, selectedSquare, boardPieces, sfx, say, recordAttempt]
  );

  const handleNext = useCallback(() => { sfx("button-tap"); advanceWatch(); }, [sfx, advanceWatch]);
  const handleGoHome = useCallback(() => { sfx("button-tap"); router.push("/"); }, [sfx, router]);
  const handleContinue = useCallback(() => {
    sfx("button-tap");
    router.push(`/?completed=${encodeURIComponent(lesson.id)}&stars=${state.stars}`);
  }, [sfx, router, lesson.id, state.stars]);

  const totalDots = totalWatchSteps + totalPuzzles;
  const currentDotIndex =
    state.phase === "watch"
      ? state.stepIndex
      : state.phase === "try"
        ? totalWatchSteps + state.puzzleIndex
        : totalDots;

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--ck-bg)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={handleGoHome}
          className="w-10 h-10 rounded-full flex items-center justify-center card-pillow"
          aria-label="Go home"
        >
          <House size={22} weight="fill" style={{ color: "var(--ck-purple)" }} />
        </button>

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
          <div className="flex flex-col items-center gap-5 animate-slide-in mt-auto mb-auto">
            <Confetti active />
            <Pikku expression="celebrating" size={64} />
            <h2 className="text-2xl font-extrabold" style={{ color: "var(--ck-purple-dark)" }}>
              {t(state.stars === 3 ? "celebrate_3_stars" : state.stars === 2 ? "celebrate_2_stars" : "celebrate_1_star")}
            </h2>
            <StarDisplay stars={state.stars} size={56} />
            <button onClick={handleContinue} className="btn-3d btn-3d-purple mt-2 flex items-center gap-2">
              {t("continue")}
              <ArrowRight size={22} weight="bold" />
            </button>
          </div>
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
              phase={phaseOverride ?? (narrationOverride ? "try" : (state.phase as "watch" | "try"))}
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
                interactive={state.phase === "try"}
              />
            </div>

            {state.phase === "watch" && (
              <button onClick={handleNext} className="btn-3d btn-3d-pink flex items-center gap-2 animate-gentle-bounce">
                Next
                <ArrowRight size={22} weight="bold" />
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
