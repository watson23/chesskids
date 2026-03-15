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
 * Converts a board pieces record into a FEN string.
 * Used by lessons/puzzles to calculate legal moves via chess.js.
 * Turn is inferred from the moving piece color. Castling/en passant
 * are omitted (not relevant for showing legal move indicators).
 */
export function boardPiecesToFen(
  pieces: Record<string, ChessPiece>,
  turn: "white" | "black" = "white"
): string {
  const typeToChar: Record<PieceType, string> = {
    pawn: "p", knight: "n", bishop: "b", rook: "r", queen: "q", king: "k",
  };
  const rows: string[] = [];
  for (let rank = 8; rank >= 1; rank--) {
    let row = "";
    let empty = 0;
    for (let file = 0; file < 8; file++) {
      const sq = `${String.fromCharCode(97 + file)}${rank}`;
      const piece = pieces[sq];
      if (piece) {
        if (empty > 0) { row += empty; empty = 0; }
        const ch = typeToChar[piece.type];
        row += piece.color === "white" ? ch.toUpperCase() : ch;
      } else {
        empty++;
      }
    }
    if (empty > 0) row += empty;
    rows.push(row);
  }
  return `${rows.join("/")} ${turn === "white" ? "w" : "b"} KQkq - 0 1`;
}

/**
 * Returns all legal destination squares for a piece, given a board pieces record.
 * Builds a temporary FEN and delegates to chess.js.
 */
export function getLegalMovesFromBoard(
  pieces: Record<string, ChessPiece>,
  square: Square,
  turn: "white" | "black"
): Square[] {
  const fen = boardPiecesToFen(pieces, turn);
  try {
    return getValidMovesForSquare(fen, square);
  } catch {
    return [];
  }
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

/**
 * Returns the square of the king that is in check, or null if no king is in check.
 */
export function getCheckSquare(fen: string): Square | null {
  const chess = new Chess(fen);
  if (!chess.isCheck()) return null;
  // The side to move is the one in check
  const kingColor = chess.turn(); // 'w' or 'b'
  const board = chess.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === "k" && piece.color === kingColor) {
        return piece.square as Square;
      }
    }
  }
  return null;
}
