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

  if (level === 3) {
    // Level 3: basic evaluation
    let bestScore = -Infinity;
    let bestMoves: typeof moves = [];

    for (const move of moves) {
      let score = 0;

      if (move.captured) {
        score += PIECE_VALUES[move.captured] * 10;
      }

      const centerSquares = ["d4", "d5", "e4", "e5"];
      if (centerSquares.includes(move.to)) {
        score += 1;
      }

      const testChess = new Chess(fen);
      testChess.move(move);

      if (testChess.isCheckmate()) {
        score += 1000;
      } else if (testChess.isCheck()) {
        score += 3;
      }

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

  // Level 4: 2-ply minimax — evaluate our move + opponent's best reply
  let bestScore = -Infinity;
  let bestMoves: typeof moves = [];

  for (const move of moves) {
    const afterMove = new Chess(fen);
    afterMove.move(move);

    // If we checkmate immediately, pick it
    if (afterMove.isCheckmate()) {
      return { from: move.from as Square, to: move.to as Square };
    }

    let moveScore = 0;

    // Material gained
    if (move.captured) {
      moveScore += PIECE_VALUES[move.captured] * 10;
    }

    // Center control bonus
    const center = ["d4", "d5", "e4", "e5"];
    const extendedCenter = ["c3", "c4", "c5", "c6", "d3", "d6", "e3", "e6", "f3", "f4", "f5", "f6"];
    if (center.includes(move.to)) moveScore += 2;
    else if (extendedCenter.includes(move.to)) moveScore += 0.5;

    // Check bonus
    if (afterMove.isCheck()) moveScore += 3;

    // Look at opponent's best reply (minimax ply 2)
    const opponentMoves = afterMove.moves({ verbose: true });
    let worstOpponentScore = 0; // best opponent reply from their perspective

    for (const opMove of opponentMoves) {
      let opScore = 0;

      if (opMove.captured) {
        opScore += PIECE_VALUES[opMove.captured] * 10;
      }

      const afterOp = new Chess(afterMove.fen());
      afterOp.move(opMove);

      if (afterOp.isCheckmate()) {
        opScore += 1000;
      } else if (afterOp.isCheck()) {
        opScore += 2;
      }

      if (opScore > worstOpponentScore) {
        worstOpponentScore = opScore;
      }
    }

    // Net evaluation: our gain minus opponent's best response
    moveScore -= worstOpponentScore;

    // Tiny random factor for variety
    moveScore += Math.random() * 0.3;

    if (moveScore > bestScore) {
      bestScore = moveScore;
      bestMoves = [move];
    } else if (Math.abs(moveScore - bestScore) < 0.4) {
      bestMoves.push(move);
    }
  }

  const chosen = bestMoves[Math.floor(Math.random() * bestMoves.length)];
  return { from: chosen.from as Square, to: chosen.to as Square };
}
