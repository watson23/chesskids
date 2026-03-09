import { describe, it, expect } from "vitest";
import { squareToCoords, coordsToSquare, isLightSquare, getAllSquares } from "./board-utils";

describe("board-utils", () => {
  it("converts square notation to grid coordinates", () => {
    expect(squareToCoords("a1")).toEqual({ col: 0, row: 7 });
    expect(squareToCoords("h8")).toEqual({ col: 7, row: 0 });
    expect(squareToCoords("e4")).toEqual({ col: 4, row: 4 });
  });

  it("converts grid coordinates to square notation", () => {
    expect(coordsToSquare(0, 7)).toBe("a1");
    expect(coordsToSquare(7, 0)).toBe("h8");
  });

  it("identifies light and dark squares", () => {
    expect(isLightSquare("a1")).toBe(false);
    expect(isLightSquare("a2")).toBe(true);
    expect(isLightSquare("h1")).toBe(true);
    expect(isLightSquare("h8")).toBe(false);
  });

  it("returns all 64 squares", () => {
    const squares = getAllSquares();
    expect(squares).toHaveLength(64);
    expect(squares).toContain("a1");
    expect(squares).toContain("h8");
    expect(squares).toContain("e4");
  });
});
