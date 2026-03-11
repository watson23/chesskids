import { describe, it, expect } from "vitest";
import { calculateStars } from "./scoring";

describe("calculateStars", () => {
  it("returns 3 stars for 0 wrong attempts", () => {
    expect(calculateStars(0)).toBe(3);
  });

  it("returns 2 stars for 1 wrong attempt", () => {
    expect(calculateStars(1)).toBe(2);
  });

  it("returns 2 stars for 2 wrong attempts", () => {
    expect(calculateStars(2)).toBe(2);
  });

  it("returns 1 star for 3 wrong attempts", () => {
    expect(calculateStars(3)).toBe(1);
  });

  it("returns 1 star for many wrong attempts", () => {
    expect(calculateStars(10)).toBe(1);
    expect(calculateStars(100)).toBe(1);
  });
});
