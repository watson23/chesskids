/**
 * Centralized timing constants for animations and delays.
 * Adjust these to tune the feel of the app in one place.
 */

// -- Narration & audio --
/** Delay before narration starts after a phase/step change */
export const NARRATION_DELAY = 300;

// -- Puzzle interaction --
/** How long to show success state before advancing to next puzzle */
export const SUCCESS_DISPLAY_DURATION = 2500;
/** How long wrong-move narration override stays visible */
export const WRONG_NARRATION_DURATION = 2000;
/** How long the wrong-move red flash plays */
export const WRONG_FLASH_DURATION = 600;
/** Idle time before showing tap hint */
export const TAP_HINT_IDLE = 4000;

// -- Watch phase (lesson) --
/** Delay before auto-animating piece movement in watch phase */
export const WATCH_ANIM_DELAY = 1200;
/** Duration to show move indicators after watch animation completes (added to WATCH_ANIM_DELAY) */
export const WATCH_INDICATORS_LINGER = 1500;

// -- Board & transitions --
/** Board fade duration on phase change */
export const BOARD_TRANSITION_DURATION = 300;
/** Capture fade-out animation */
export const CAPTURE_FADE_DURATION = 350;
/** Piece shake animation (treasure chest, lesson stop) */
export const SHAKE_DURATION = 400;

// -- Journey map --
/** Delay before sparkle starts on lesson unlock */
export const MAP_SPARKLE_DELAY = 300;
/** Delay before Piku starts walking to next node */
export const MAP_WALK_DELAY = 700;
/** Pause after Piku arrives at a node */
export const MAP_ARRIVE_PAUSE = 600;
/** Duration of celebration/glow after arriving */
export const MAP_CELEBRATE_DURATION = 1500;
/** Duration to hold chest glow or completion celebration */
export const MAP_CHEST_GLOW_DURATION = 3000;

// -- Watch tap feedback --
/** Duration of "watch first" wobble feedback */
export const WATCH_TAP_FEEDBACK_DURATION = 2000;

// -- Game --
/** Delay before showing result overlay after game ends */
export const GAME_RESULT_DELAY = 3500;
/** Duration of Piku mood expression after a move */
export const PIKU_MOOD_DURATION = 2500;

// -- Opponent selector --
/** Duration of wiggle animation on locked opponent */
export const WIGGLE_DURATION = 600;
