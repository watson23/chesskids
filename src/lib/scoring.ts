/**
 * Calculate star rating based on wrong attempts.
 * Used by both lesson and puzzle completion screens.
 *
 * - 0 wrong → 3 stars
 * - 1-2 wrong → 2 stars
 * - 3+ wrong → 1 star
 */
export function calculateStars(wrongAttempts: number): number {
  if (wrongAttempts === 0) return 3;
  if (wrongAttempts <= 2) return 2;
  return 1;
}
