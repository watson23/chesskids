import { LESSONS } from "@/data/lessons";

/**
 * Resolve the current lesson index from either:
 * - A lesson ID string (new format) → find its index
 * - A numeric index (legacy format) → use directly
 *
 * Returns the index into the LESSONS array (0 = first lesson not yet started).
 * If the lesson ID is not found, falls back to 0.
 */
export function resolveCurrentLessonIndex(currentLesson: string | number): number {
  if (typeof currentLesson === "number") {
    // Legacy format: already an index, clamp to valid range
    return Math.max(0, Math.min(currentLesson, LESSONS.length));
  }

  if (currentLesson === "") return 0;

  // New format: lesson ID string — find the index of the NEXT lesson
  // If currentLesson is "pawn-intro", that means the player should play "pawn-intro" next,
  // so the index is the position of that lesson in the array
  const index = LESSONS.findIndex((l) => l.id === currentLesson);
  return index >= 0 ? index : 0;
}

/**
 * Get the lesson ID for a given index. Returns the lesson ID at that position,
 * or a sentinel value if the index is beyond the last lesson (all completed).
 */
export function getLessonIdAtIndex(index: number): string {
  if (index >= LESSONS.length) return "__all_complete__";
  if (index < 0) return LESSONS[0].id;
  return LESSONS[index].id;
}
