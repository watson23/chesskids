import { Chess } from "chess.js";
import type { Square, AIDifficulty } from "@/types/chess";

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

/**
 * Returns an AI-selected move for the given position and difficulty level.
 *
 * - Level 1: random legal move
 * - Level 2: prefers captures, otherwise random
 * - Level 3: basic evaluation (captures by value, center control, checks, checkmate)
 *
 * Returns null if no legal moves are available (checkmate or stalemate).
 */
export function getAIMove(
  fen: string,
  level: AIDifficulty
): { from: Square; to: Square } | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  if (level === 1) {
    // Random legal move
    const move = moves[Math.floor(Math.random() * moves.length)];
    return { from: move.from as Square, to: move.to as Square };
  }

  if (level === 2) {
    // Prefer captures, otherwise random
    const captures = moves.filter((m) => m.captured);
    if (captures.length > 0) {
      const move = captures[Math.floor(Math.random() * captures.length)];
      return { from: move.from as Square, to: move.to as Square };
    }
    const move = moves[Math.floor(Math.random() * moves.length)];
    return { from: move.from as Square, to: move.to as Square };
  }

  // Level 3: basic evaluation
  let bestScore = -Infinity;
  let bestMoves: typeof moves = [];

  for (const move of moves) {
    let score = 0;

    // Strongly prefer captures by piece value
    if (move.captured) {
      score += PIECE_VALUES[move.captured] * 10;
    }

    // Reward center control
    const centerSquares = ["d4", "d5", "e4", "e5"];
    if (centerSquares.includes(move.to)) {
      score += 1;
    }

    // Evaluate resulting position
    const testChess = new Chess(fen);
    testChess.move(move);

    if (testChess.isCheckmate()) {
      score += 1000;
    } else if (testChess.isCheck()) {
      score += 3;
    }

    // Small random factor for variety (but not enough to override real advantages)
    score += Math.random() * 0.5;

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (Math.abs(score - bestScore) < 0.6) {
      bestMoves.push(move);
    }
  }

  const chosen = bestMoves[Math.floor(Math.random() * bestMoves.length)];
  return { from: chosen.from as Square, to: chosen.to as Square };
}
