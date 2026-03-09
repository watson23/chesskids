import { describe, it, expect } from "vitest";
import { getAIMove } from "./chess-ai";

describe("chess-ai", () => {
  it("level 1: returns a legal move", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
    const move = getAIMove(fen, 1);
    expect(move).not.toBeNull();
    expect(move!.from).toBeTruthy();
    expect(move!.to).toBeTruthy();
  });

  it("level 2: captures when possible", () => {
    // Black pawn on d5, white pawn on e4 — black to move, should capture
    const fen = "8/8/8/3p4/4P3/8/8/4K2k b - - 0 1";
    const move = getAIMove(fen, 2);
    expect(move!.to).toBe("e4");
  });

  it("level 3: prefers higher-value captures", () => {
    // Black queen on d5 can capture white pawn on c4 or white queen on e4
    // Should prefer the queen (value 9) over the pawn (value 1)
    const fen = "8/8/8/3q4/2P1Q3/8/8/4K2k b - - 0 1";
    const move = getAIMove(fen, 3);
    expect(move!.to).toBe("e4");
  });

  it("returns null when no legal moves (stalemate)", () => {
    // Black king on a8, white king on c7, white queen on b6 — black to move, stalemate
    const fen = "k7/2K5/1Q6/8/8/8/8/8 b - - 0 1";
    const move = getAIMove(fen, 1);
    expect(move).toBeNull();
  });

  it("level 1: returns different moves across many calls (randomness)", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
    const moves = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const move = getAIMove(fen, 1);
      if (move) moves.add(`${move.from}-${move.to}`);
    }
    // With 20 possible black moves, we should see more than 1 unique move
    expect(moves.size).toBeGreaterThan(1);
  });

  it("level 2: picks random move when no captures available", () => {
    // Starting position — no captures possible
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const move = getAIMove(fen, 1);
    expect(move).not.toBeNull();
  });

  it("level 3: prefers checkmate", () => {
    // White queen on h1, white king on b6, black king on a8
    // Two checkmates available: Qb7# and Qh8#
    const fen = "k7/8/1K6/8/8/8/8/7Q w - - 0 1";
    const move = getAIMove(fen, 3);
    expect(move).not.toBeNull();
    // Should pick one of the checkmate squares
    expect(["b7", "h8"]).toContain(move!.to);
  });
});
