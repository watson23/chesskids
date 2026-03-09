"use client";

import { useState, useCallback, useMemo } from "react";
import type { Square, ChessPiece, PieceType } from "@/types/chess";
import {
  getValidMovesForSquare,
  makeMove,
  isGameOver,
  boardToRecord,
  getCurrentTurn,
} from "@/lib/chess-helpers";

const STARTING_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

interface UseChessGameOptions {
  initialFen?: string;
  playerColor?: "white" | "black" | "both";
  onMove?: (from: Square, to: Square, captured?: PieceType) => void;
  onGameOver?: (result: "checkmate" | "stalemate" | "draw") => void;
}

interface UseChessGameReturn {
  /** Current FEN string */
  fen: string;
  /** Piece positions derived from FEN */
  pieces: Record<string, ChessPiece>;
  /** Currently selected square (if any) */
  selectedSquare: Square | null;
  /** Valid move destinations for the selected piece */
  validMoves: Square[];
  /** Last move made (for highlighting) */
  lastMove: { from: Square; to: Square } | null;
  /** Whose turn it is */
  turn: "white" | "black";
  /** Whether the game is over and the result */
  gameOver: { over: boolean; result: "checkmate" | "stalemate" | "draw" | null };
  /** Handle a square being tapped — select or move */
  handleSquareTap: (square: Square) => void;
  /** Reset the game to initial or new position */
  reset: (newFen?: string) => void;
}

export function useChessGame(options: UseChessGameOptions = {}): UseChessGameReturn {
  const {
    initialFen = STARTING_FEN,
    playerColor = "both",
    onMove,
    onGameOver,
  } = options;

  const [fen, setFen] = useState(initialFen);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  const pieces = useMemo(() => boardToRecord(fen), [fen]);
  const turn = useMemo(() => getCurrentTurn(fen), [fen]);
  const gameOver = useMemo(() => isGameOver(fen), [fen]);

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setValidMoves([]);
  }, []);

  const selectSquare = useCallback(
    (square: Square) => {
      const moves = getValidMovesForSquare(fen, square);
      if (moves.length > 0) {
        setSelectedSquare(square);
        setValidMoves(moves);
      } else {
        clearSelection();
      }
    },
    [fen, clearSelection]
  );

  const handleSquareTap = useCallback(
    (square: Square) => {
      // If game is over, ignore taps
      if (gameOver.over) return;

      // If it's not the player's turn (in single-color mode), ignore taps
      if (playerColor !== "both" && turn !== playerColor) return;

      // If a piece is already selected...
      if (selectedSquare) {
        // Tapping the same square deselects
        if (square === selectedSquare) {
          clearSelection();
          return;
        }

        // Tapping a valid move destination executes the move
        if (validMoves.includes(square)) {
          const result = makeMove(fen, selectedSquare, square);
          if (result) {
            setFen(result.fen);
            setLastMove({ from: selectedSquare, to: square });
            clearSelection();
            onMove?.(selectedSquare, square, result.captured);

            // Check for game over after move
            const gameState = isGameOver(result.fen);
            if (gameState.over && gameState.result) {
              onGameOver?.(gameState.result);
            }
          }
          return;
        }

        // Tapping another own piece re-selects it
        const tappedPiece = pieces[square];
        if (tappedPiece && tappedPiece.color === turn) {
          selectSquare(square);
          return;
        }

        // Tapping an invalid square deselects
        clearSelection();
        return;
      }

      // No piece selected — try to select one
      const tappedPiece = pieces[square];
      if (tappedPiece && tappedPiece.color === turn) {
        selectSquare(square);
      }
    },
    [
      fen,
      selectedSquare,
      validMoves,
      pieces,
      turn,
      gameOver,
      playerColor,
      clearSelection,
      selectSquare,
      onMove,
      onGameOver,
    ]
  );

  const reset = useCallback(
    (newFen?: string) => {
      setFen(newFen ?? initialFen);
      clearSelection();
      setLastMove(null);
    },
    [initialFen, clearSelection]
  );

  return {
    fen,
    pieces,
    selectedSquare,
    validMoves,
    lastMove,
    turn,
    gameOver,
    handleSquareTap,
    reset,
  };
}
