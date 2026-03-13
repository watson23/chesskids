import { describe, it, expect } from "vitest";
import { isBareKing } from "./stuck-detection";

describe("isBareKing", () => {
  it("returns true when white has only a king", () => {
    // White king on e1, black has king + rook
    const fen = "r3k3/8/8/8/8/8/8/4K3 w - - 0 1";
    expect(isBareKing(fen, "white")).toBe(true);
  });

  it("returns false when white has king + pawn", () => {
    const fen = "r3k3/8/8/8/8/8/4P3/4K3 w - - 0 1";
    expect(isBareKing(fen, "white")).toBe(false);
  });

  it("returns false for the starting position", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    expect(isBareKing(fen, "white")).toBe(false);
  });

  it("returns true when black has only a king", () => {
    const fen = "4k3/8/8/8/8/8/4P3/4K3 w - - 0 1";
    expect(isBareKing(fen, "black")).toBe(true);
  });
});
