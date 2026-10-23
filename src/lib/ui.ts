/**
 * Shared sizing tokens (px) so characters, buttons and tiles read as one
 * system across every screen. Pick from here instead of inventing numbers.
 */
export const UI = {
  /** Round frosted nav buttons: back, home, close, settings, rewards… */
  nav: { button: 56, icon: 36 },
  /** Primary round actions: next, continue, play again, go back. */
  action: { button: 72, icon: 40 },
  /** Piku the mascot. */
  piku: {
    /** Bust/half-body Piku talking in a header or coaching beside a board. */
    talk: 96,
    /** Full-body Piku standing inside a flow (onboarding, map overlays). */
    standing: 120,
    /** Piku as the hero of a screen (intro, celebrations, outfit preview). */
    hero: 200,
  },
  /** Animal opponents. */
  opponent: {
    /** Portrait above the board during a game. */
    header: 96,
    /** Hero slot on the result card (loss / draw). */
    hero: 160,
    /** Small portrait on the result card when Piku is the hero (win). */
    small: 72,
    /** Portrait inside the opponent picker cards. */
    card: 80,
  },
  /** Selectable square tiles: outfits, board themes. */
  tile: { size: 64, icon: 44 },
  /** Stars. */
  star: { big: 48, inline: 16 },
  /** Speech bubble body text. */
  bubbleText: 15,
} as const;
