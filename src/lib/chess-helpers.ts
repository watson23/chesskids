import { Chess } from "chess.js";
import type { Square, ChessPiece, PieceType } from "@/types/chess";

const PIECE_MAP: Record<string, PieceType> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

/**
 * Returns all valid destination squares for a piece on the given square.
 * Returns an empty array if the square is empty or it's not that piece's turn.
 */
export function getValidMovesForSquare(fen: string, square: Square): Square[] {
  const chess = new Chess(fen);
  const moves = chess.moves({ square, verbose: true });
  return moves.map((m) => m.to as Square);
}

/**
 * Attempts to make a move from one square to another.
 * Returns the new FEN and any captured piece type, or null if the move is invalid.
 * Pawns are auto-promoted to queen.
 */
export function makeMove(
  fen: string,
  from: Square,
  to: Square
): { fen: string; captured?: PieceType } | null {
  const chess = new Chess(fen);
  try {
    const move = chess.move({ from, to, promotion: "q" });
    if (!move) return null;
    return {
      fen: chess.fen(),
      captured: move.captured ? PIECE_MAP[move.captured] : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Converts a FEN string into a record mapping square names to ChessPiece objects.
 * Only squares with pieces are included.
 */
export function boardToRecord(fen: string): Record<string, ChessPiece> {
  const chess = new Chess(fen);
  const record: Record<string, ChessPiece> = {};
  const board = chess.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        record[piece.square as string] = {
          type: PIECE_MAP[piece.type],
          color: piece.color === "w" ? "white" : "black",
        };
      }
    }
  }
  return record;
}

/**
 * Checks if the game is over in the given position.
 * Returns the game-over state and the specific result.
 */
export function isGameOver(fen: string): {
  over: boolean;
  result: "checkmate" | "stalemate" | "draw" | null;
} {
  const chess = new Chess(fen);
  if (chess.isCheckmate()) return { over: true, result: "checkmate" };
  if (chess.isStalemate()) return { over: true, result: "stalemate" };
  if (chess.isDraw()) return { over: true, result: "draw" };
  return { over: false, result: null };
}

/**
 * Returns which side is to move in the given FEN position.
 */
export function getCurrentTurn(fen: string): "white" | "black" {
  const chess = new Chess(fen);
  return chess.turn() === "w" ? "white" : "black";
}
