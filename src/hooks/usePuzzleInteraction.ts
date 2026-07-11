"use client";

import { useState, useCallback, useRef } from "react";
import type { Square, ChessPiece } from "@/types/chess";
import type { LocaleKey } from "@/types/locale";
import type { SoundEffect } from "@/types/audio";
import { getLegalMovesFromBoard } from "@/lib/chess-helpers";
import { WRONG_FLASH_DURATION, WRONG_NARRATION_DURATION, DENIED_TAP_DURATION } from "@/lib/timing";

interface CorrectMove {
  from: Square;
  to: Square;
}

interface PuzzleConfig {
  correctMoves: CorrectMove[];
  successNarrationKey: LocaleKey;
  wrongMoveNarrationKey: LocaleKey;
  /** Friendlier narration when the wrong move was a capture (a good idea, just not the best) */
  wrongCaptureNarrationKey?: LocaleKey;
}

interface UsePuzzleInteractionOptions {
  sfx: (effect: SoundEffect) => void;
  say: (key: LocaleKey) => void;
  /**
   * When true (lessons), only correct-answer pieces can be selected and their
   * correct destinations show as golden dots. When false (practice), any of
   * the player's pieces can be selected and no golden hints are shown — the
   * kid has to find the answer themselves.
   */
  revealCorrectMoves?: boolean;
}

interface UsePuzzleInteractionReturn {
  selectedSquare: Square | null;
  validMoves: Square[];
  correctMoveSquares: Square[];
  lastMove: { from: Square; to: Square } | null;
  boardPieces: Record<string, ChessPiece>;
  wrongFlash: boolean;
  /** Square whose piece was tapped but can't be selected — wobble it briefly */
  deniedSquare: Square | null;
  narrationOverride: LocaleKey | null;
  setBoardPieces: React.Dispatch<React.SetStateAction<Record<string, ChessPiece>>>;
  setLastMove: React.Dispatch<React.SetStateAction<{ from: Square; to: Square } | null>>;
  setValidMoves: React.Dispatch<React.SetStateAction<Square[]>>;
  handleSquareTap: (square: Square, puzzle: PuzzleConfig | null, active: boolean) => boolean | null;
  resetBoard: (setup: Record<string, ChessPiece>) => void;
  clearNarrationOverride: () => void;
}

/**
 * Applies a piece move on the board, handling castling, en passant, and promotion.
 * Returns a new pieces record (does not mutate the original).
 */
export function applyPieceMove(
  pieces: Record<string, ChessPiece>,
  from: Square,
  to: Square,
): Record<string, ChessPiece> {
  const piece = pieces[from];
  if (!piece) return pieces;

  const newPieces = { ...pieces };
  delete newPieces[from];

  // Promotion: pawn reaching back rank becomes queen
  const destRank = to[1];
  if (piece.type === "pawn" && (destRank === "8" || destRank === "1")) {
    newPieces[to] = { ...piece, type: "queen" };
  } else {
    newPieces[to] = piece;
  }

  // Castling: king moves 2 squares → also move the rook
  if (piece.type === "king") {
    const fromFile = from.charCodeAt(0);
    const toFile = to.charCodeAt(0);
    const rank = to[1];
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
    const fromFile = from[0];
    const toFile = to[0];
    if (fromFile !== toFile && !pieces[to]) {
      const capturedSquare = `${toFile}${from[1]}` as Square;
      delete newPieces[capturedSquare];
    }
  }

  return newPieces;
}

/**
 * Shared hook for puzzle/lesson piece interaction:
 * selection, move validation, correct/wrong move handling.
 *
 * `handleSquareTap` returns:
 * - `true` if the move was correct
 * - `false` if the move was wrong
 * - `null` if the tap was just a selection/deselection (no move attempted)
 */
export function usePuzzleInteraction({
  sfx,
  say,
  revealCorrectMoves = true,
}: UsePuzzleInteractionOptions): UsePuzzleInteractionReturn {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [correctMoveSquares, setCorrectMoveSquares] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [boardPieces, setBoardPieces] = useState<Record<string, ChessPiece>>({});
  const [wrongFlash, setWrongFlash] = useState(false);
  const [deniedSquare, setDeniedSquare] = useState<Square | null>(null);
  const deniedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [narrationOverride, setNarrationOverride] = useState<LocaleKey | null>(null);

  const denySquare = useCallback((square: Square) => {
    if (deniedTimer.current) clearTimeout(deniedTimer.current);
    setDeniedSquare(square);
    deniedTimer.current = setTimeout(() => setDeniedSquare(null), DENIED_TAP_DURATION);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setValidMoves([]);
    setCorrectMoveSquares([]);
  }, []);

  const resetBoard = useCallback((setup: Record<string, ChessPiece>) => {
    setBoardPieces(setup);
    setSelectedSquare(null);
    setValidMoves([]);
    setCorrectMoveSquares([]);
    setLastMove(null);
    setNarrationOverride(null);
  }, []);

  const clearNarrationOverride = useCallback(() => {
    setNarrationOverride(null);
  }, []);

  const handleSquareTap = useCallback(
    (square: Square, puzzle: PuzzleConfig | null, active: boolean): boolean | null => {
      if (!active || !puzzle) return null;
      const { correctMoves: moves } = puzzle;

      // The kid plays the color of the correct-answer pieces
      const playerColor = moves
        .map((m) => boardPieces[m.from])
        .find(Boolean)?.color;

      const selectSquare = (sq: Square) => {
        const piece = boardPieces[sq];
        if (!piece) return false;
        // Lessons: only correct-answer pieces are selectable (guided).
        // Practice: any of the kid's own pieces (they must find the answer).
        const selectable = revealCorrectMoves
          ? moves.some((m) => m.from === sq)
          : piece.color === playerColor;
        if (!selectable) return false;
        setSelectedSquare(sq);
        sfx("piece-pickup");
        setValidMoves(getLegalMovesFromBoard(boardPieces, sq, piece.color));
        setCorrectMoveSquares(
          revealCorrectMoves
            ? moves.filter((m) => m.from === sq).map((m) => m.to)
            : []
        );
        return true;
      };

      // No piece selected yet — try to select
      if (selectedSquare === null) {
        if (!selectSquare(square) && boardPieces[square]) {
          // Tapped a piece that can't be picked up — wobble it as feedback
          denySquare(square);
        }
        return null;
      }

      // Tapping the same square — deselect
      if (square === selectedSquare) {
        clearSelection();
        return null;
      }

      // Tapping another of the kid's own pieces — switch selection (or just
      // deselect), never count it as a wrong move
      if (boardPieces[square]?.color === boardPieces[selectedSquare]?.color) {
        clearSelection();
        if (!selectSquare(square)) {
          denySquare(square);
        }
        return null;
      }

      // Attempt a move
      const isCorrect = moves.some((m) => m.from === selectedSquare && m.to === square);

      if (isCorrect) {
        setBoardPieces((prev) => applyPieceMove(prev, selectedSquare, square));
        setLastMove({ from: selectedSquare, to: square });
        clearSelection();
        sfx("piece-place");
        say(puzzle.successNarrationKey);
        setNarrationOverride(puzzle.successNarrationKey);
        return true;
      } else {
        // A capture attempt gets the friendlier "good idea, but…" narration
        // when the puzzle provides one (e.g. best-move puzzles)
        const wrongKey =
          boardPieces[square] && puzzle.wrongCaptureNarrationKey
            ? puzzle.wrongCaptureNarrationKey
            : puzzle.wrongMoveNarrationKey;
        sfx("wrong-move");
        say(wrongKey);
        clearSelection();
        setWrongFlash(true);
        setNarrationOverride(wrongKey);
        setTimeout(() => setWrongFlash(false), WRONG_FLASH_DURATION);
        setTimeout(() => setNarrationOverride(null), WRONG_NARRATION_DURATION);
        return false;
      }
    },
    [selectedSquare, boardPieces, sfx, say, clearSelection, revealCorrectMoves, denySquare]
  );

  return {
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
    handleSquareTap,
    resetBoard,
    clearNarrationOverride,
  };
}
