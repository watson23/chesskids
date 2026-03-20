import { describe, it, expect } from "vitest";
import { applyPieceMove } from "./usePuzzleInteraction";
import type { ChessPiece } from "@/types/chess";

describe("applyPieceMove", () => {
  it("moves a piece from one square to another", () => {
    const pieces: Record<string, ChessPiece> = {
      e2: { type: "pawn", color: "white" },
    };
    const result = applyPieceMove(pieces, "e2", "e4");
    expect(result["e4"]).toEqual({ type: "pawn", color: "white" });
    expect(result["e2"]).toBeUndefined();
  });

  it("captures a piece on the destination square", () => {
    const pieces: Record<string, ChessPiece> = {
      d4: { type: "knight", color: "white" },
      e6: { type: "pawn", color: "black" },
    };
    const result = applyPieceMove(pieces, "d4", "e6");
    expect(result["e6"]).toEqual({ type: "knight", color: "white" });
    expect(result["d4"]).toBeUndefined();
  });

  it("promotes a white pawn reaching rank 8 to queen", () => {
    const pieces: Record<string, ChessPiece> = {
      a7: { type: "pawn", color: "white" },
    };
    const result = applyPieceMove(pieces, "a7", "a8");
    expect(result["a8"]).toEqual({ type: "queen", color: "white" });
    expect(result["a7"]).toBeUndefined();
  });

  it("promotes a black pawn reaching rank 1 to queen", () => {
    const pieces: Record<string, ChessPiece> = {
      h2: { type: "pawn", color: "black" },
    };
    const result = applyPieceMove(pieces, "h2", "h1");
    expect(result["h1"]).toEqual({ type: "queen", color: "black" });
  });

  it("does not promote a pawn moving to a non-back rank", () => {
    const pieces: Record<string, ChessPiece> = {
      e2: { type: "pawn", color: "white" },
    };
    const result = applyPieceMove(pieces, "e2", "e4");
    expect(result["e4"]).toEqual({ type: "pawn", color: "white" });
  });

  it("handles kingside castling (king moves 2 squares right)", () => {
    const pieces: Record<string, ChessPiece> = {
      e1: { type: "king", color: "white" },
      h1: { type: "rook", color: "white" },
    };
    const result = applyPieceMove(pieces, "e1", "g1");
    expect(result["g1"]).toEqual({ type: "king", color: "white" });
    expect(result["f1"]).toEqual({ type: "rook", color: "white" });
    expect(result["e1"]).toBeUndefined();
    expect(result["h1"]).toBeUndefined();
  });

  it("handles queenside castling (king moves 2 squares left)", () => {
    const pieces: Record<string, ChessPiece> = {
      e1: { type: "king", color: "white" },
      a1: { type: "rook", color: "white" },
    };
    const result = applyPieceMove(pieces, "e1", "c1");
    expect(result["c1"]).toEqual({ type: "king", color: "white" });
    expect(result["d1"]).toEqual({ type: "rook", color: "white" });
    expect(result["e1"]).toBeUndefined();
    expect(result["a1"]).toBeUndefined();
  });

  it("handles black kingside castling", () => {
    const pieces: Record<string, ChessPiece> = {
      e8: { type: "king", color: "black" },
      h8: { type: "rook", color: "black" },
    };
    const result = applyPieceMove(pieces, "e8", "g8");
    expect(result["g8"]).toEqual({ type: "king", color: "black" });
    expect(result["f8"]).toEqual({ type: "rook", color: "black" });
  });

  it("handles en passant (white pawn captures diagonally to empty square)", () => {
    const pieces: Record<string, ChessPiece> = {
      e5: { type: "pawn", color: "white" },
      d5: { type: "pawn", color: "black" },
    };
    const result = applyPieceMove(pieces, "e5", "d6");
    expect(result["d6"]).toEqual({ type: "pawn", color: "white" });
    expect(result["d5"]).toBeUndefined(); // captured pawn removed
    expect(result["e5"]).toBeUndefined();
  });

  it("handles en passant (black pawn captures diagonally to empty square)", () => {
    const pieces: Record<string, ChessPiece> = {
      c4: { type: "pawn", color: "black" },
      d4: { type: "pawn", color: "white" },
    };
    const result = applyPieceMove(pieces, "c4", "d3");
    expect(result["d3"]).toEqual({ type: "pawn", color: "black" });
    expect(result["d4"]).toBeUndefined(); // captured pawn removed
  });

  it("does not remove a piece on normal diagonal pawn capture (not en passant)", () => {
    const pieces: Record<string, ChessPiece> = {
      e4: { type: "pawn", color: "white" },
      d5: { type: "pawn", color: "black" },
    };
    const result = applyPieceMove(pieces, "e4", "d5");
    expect(result["d5"]).toEqual({ type: "pawn", color: "white" });
    expect(result["e4"]).toBeUndefined();
    // Should NOT have removed anything extra — d5 was occupied (normal capture)
  });

  it("does not move king's rook when king moves only 1 square", () => {
    const pieces: Record<string, ChessPiece> = {
      e1: { type: "king", color: "white" },
      h1: { type: "rook", color: "white" },
    };
    const result = applyPieceMove(pieces, "e1", "f1");
    expect(result["f1"]).toEqual({ type: "king", color: "white" });
    expect(result["h1"]).toEqual({ type: "rook", color: "white" }); // rook stays
  });

  it("returns pieces unchanged if source square is empty", () => {
    const pieces: Record<string, ChessPiece> = {
      e2: { type: "pawn", color: "white" },
    };
    const result = applyPieceMove(pieces, "a1", "a2");
    expect(result).toEqual(pieces);
  });

  it("does not mutate the original pieces object", () => {
    const pieces: Record<string, ChessPiece> = {
      e2: { type: "pawn", color: "white" },
    };
    const result = applyPieceMove(pieces, "e2", "e4");
    expect(pieces["e2"]).toEqual({ type: "pawn", color: "white" });
    expect(result).not.toBe(pieces);
  });
});
