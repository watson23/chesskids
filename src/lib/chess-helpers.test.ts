import { describe, it, expect } from "vitest";
import {
  getValidMovesForSquare,
  makeMove,
  isGameOver,
  boardToRecord,
  getCurrentTurn,
} from "./chess-helpers";

describe("chess-helpers", () => {
  const STARTING_FEN =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  it("returns valid moves for a pawn on e2 in starting position", () => {
    const moves = getValidMovesForSquare(STARTING_FEN, "e2");
    expect(moves).toContain("e3");
    expect(moves).toContain("e4");
    expect(moves).toHaveLength(2);
  });

  it("returns empty array for empty square", () => {
    const moves = getValidMovesForSquare(STARTING_FEN, "e4");
    expect(moves).toHaveLength(0);
  });

  it("returns empty array for opponent piece on their turn", () => {
    const moves = getValidMovesForSquare(STARTING_FEN, "e7");
    expect(moves).toHaveLength(0);
  });

  it("makes a valid move and returns new FEN", () => {
    const result = makeMove(STARTING_FEN, "e2", "e4");
    expect(result).not.toBeNull();
    expect(result!.fen).toContain("4P3");
  });

  it("returns null for invalid move", () => {
    const result = makeMove(STARTING_FEN, "e2", "e5");
    expect(result).toBeNull();
  });

  it("converts FEN board to piece record", () => {
    const record = boardToRecord(STARTING_FEN);
    expect(record["e1"]).toEqual({ type: "king", color: "white" });
    expect(record["e8"]).toEqual({ type: "king", color: "black" });
    expect(record["e4"]).toBeUndefined();
    expect(Object.keys(record)).toHaveLength(32);
  });

  it("detects game over states", () => {
    expect(isGameOver(STARTING_FEN).over).toBe(false);
    // Scholar's mate position
    const checkmateFen =
      "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3";
    const result = isGameOver(checkmateFen);
    expect(result.over).toBe(true);
    expect(result.result).toBe("checkmate");
  });

  it("returns current turn", () => {
    expect(getCurrentTurn(STARTING_FEN)).toBe("white");
    const afterE4 =
      "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
    expect(getCurrentTurn(afterE4)).toBe("black");
  });
});
