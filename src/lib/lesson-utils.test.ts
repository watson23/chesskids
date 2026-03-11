import { describe, it, expect } from "vitest";
import { resolveCurrentLessonIndex, getLessonIdAtIndex } from "./lesson-utils";
import { LESSONS } from "@/data/lessons";

describe("resolveCurrentLessonIndex", () => {
  it("returns 0 for empty string", () => {
    expect(resolveCurrentLessonIndex("")).toBe(0);
  });

  it("handles legacy numeric index", () => {
    expect(resolveCurrentLessonIndex(0)).toBe(0);
    expect(resolveCurrentLessonIndex(3)).toBe(3);
  });

  it("clamps legacy index to valid range", () => {
    expect(resolveCurrentLessonIndex(-1)).toBe(0);
    expect(resolveCurrentLessonIndex(9999)).toBe(LESSONS.length);
  });

  it("resolves known lesson ID to its index", () => {
    const firstLesson = LESSONS[0];
    expect(resolveCurrentLessonIndex(firstLesson.id)).toBe(0);

    const thirdLesson = LESSONS[2];
    expect(resolveCurrentLessonIndex(thirdLesson.id)).toBe(2);
  });

  it("returns 0 for unknown lesson ID", () => {
    expect(resolveCurrentLessonIndex("nonexistent-lesson")).toBe(0);
  });
});

describe("getLessonIdAtIndex", () => {
  it("returns first lesson ID for index 0", () => {
    expect(getLessonIdAtIndex(0)).toBe(LESSONS[0].id);
  });

  it("returns correct lesson ID for valid index", () => {
    expect(getLessonIdAtIndex(2)).toBe(LESSONS[2].id);
  });

  it("returns sentinel for index beyond lessons", () => {
    expect(getLessonIdAtIndex(LESSONS.length)).toBe("__all_complete__");
    expect(getLessonIdAtIndex(999)).toBe("__all_complete__");
  });

  it("clamps negative index to first lesson", () => {
    expect(getLessonIdAtIndex(-1)).toBe(LESSONS[0].id);
  });
});
