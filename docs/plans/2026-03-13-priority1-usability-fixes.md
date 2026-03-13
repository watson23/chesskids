# Priority 1: Usability & Flow Fixes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the five most impactful UX issues from the first kid playtest — mandatory chests, game stuck-state, watch phase clarity, audio replay, and game over screen.

**Architecture:** All changes are within existing React components and hooks. No new pages or data models needed. Chest integration hooks into the lesson completion flow in LessonPlayer. Stuck-state detection adds logic to GamePlayer. Watch phase and audio replay are visual/interaction changes to existing components.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, React hooks, Web Speech API

---

## Task 1: Mandatory Chest Opening in Lesson Completion Flow

Currently chests only appear on the journey map and the kid missed all of them. Move chest opening into the lesson celebration phase so it's impossible to skip.

**Files:**
- Modify: `src/components/LessonPlayer.tsx` — add chest modal to celebrate phase
- Modify: `src/hooks/useLessonPlayer.ts` — add "chest" sub-phase to celebrate
- Modify: `src/data/chests.ts` — export helper to find chest by lesson ID
- Modify: `src/app/page.tsx` — handle chest-already-opened via URL param
- Modify: `src/data/locale/en.json` — add chest narration keys
- Modify: `src/data/locale/fi.json` — add Finnish chest narration keys

### Step 1: Add helper to find chest unlocked by a lesson

In `src/data/chests.ts`, add:

```typescript
/** Returns the chest that unlocks after completing the given lesson, or null */
export function getChestForLesson(lessonId: string): ChestDefinition | null {
  return CHESTS.find((c) => c.afterLesson === lessonId) ?? null;
}
```

### Step 2: Extend lesson player state for chest sub-phase

In `src/hooks/useLessonPlayer.ts`, the celebrate phase currently goes straight to navigation. Add a state flag to track whether chest has been shown:

```typescript
// Add to LessonPlayerState interface
showingChest: boolean;

// When transitioning to celebrate phase (in recordAttempt):
showingChest: false,  // Initially false, set to true when chest modal opens

// Add new action:
const openChest = useCallback(() => {
  setState((prev) => ({ ...prev, showingChest: true }));
}, []);

const closeChest = useCallback(() => {
  setState((prev) => ({ ...prev, showingChest: false }));
}, []);
```

Return `openChest` and `closeChest` from the hook.

### Step 3: Integrate ChestOpenModal into LessonPlayer celebrate phase

In `src/components/LessonPlayer.tsx`:

1. Import `getChestForLesson` from chests.ts and `ChestOpenModal`
2. After the celebration animation (stars + confetti), check if this lesson unlocks a chest
3. If yes: show "a treasure chest appeared!" with the chest modal before the continue button
4. The flow becomes: celebrate → chest opens → kid taps through rewards → continue to map

```typescript
// In the celebrate phase render block:
const unlockedChest = getChestForLesson(lesson.id);
const shouldShowChest = unlockedChest && !state.showingChest && !chestDismissed;

// After star display, before continue button:
{unlockedChest && !chestDismissed && (
  <ChestOpenModal
    chest={unlockedChest}
    onClose={() => {
      setChestDismissed(true);
      // Save chest as opened (need to pass handler from parent or use context)
    }}
  />
)}

// Continue button only shows after chest is dismissed (or if no chest)
{(!unlockedChest || chestDismissed) && (
  <button onClick={handleContinue} ...>
    <Image src="/icons/icon-check-circle.webp" ... />
  </button>
)}
```

### Step 4: Pass chest-opened status via URL params

Extend the completion URL to include chest info:

```typescript
// In handleContinue:
const params = new URLSearchParams({
  completed: lesson.id,
  stars: String(state.stars),
});
if (chestDismissed && unlockedChest) {
  params.set("chest", String(unlockedChest.index));
}
router.push(`/?${params.toString()}`);
```

In `src/app/page.tsx`, extract the `chest` param and process it alongside the lesson completion:

```typescript
const chestParam = searchParams.get("chest");
if (chestParam !== null) {
  const chestIndex = parseInt(chestParam, 10);
  if (!isNaN(chestIndex)) {
    // Mark chest as opened + save rewards (reuse existing handleChestClose logic)
    handleChestOpened(chestIndex);
  }
}
```

### Step 5: Add locale keys for chest narration

In `en.json`:
```json
"chest_appeared": "Look! A treasure chest! Tap it to open!",
"chest_reward_outfit": "A new outfit for you!"
```

In `fi.json`:
```json
"chest_appeared": "Katso! Aarrearkku! Napauta avataksesi!",
"chest_reward_outfit": "Uusi asu sinulle!"
```

### Step 6: Prevent double-opening on journey map

Chests opened during lesson flow should appear as "opened" on the journey map. The existing `openedChests` state in `page.tsx` already handles this — just ensure the chest index is added to the array when processing the URL param.

### Step 7: Build and verify

Run: `npm run build`
Expected: Clean build, no TypeScript errors.

Manual test: Complete a lesson that unlocks a chest (e.g., pawn lesson → chest 0). Verify chest modal appears in the celebration flow. Verify chest shows as opened on journey map after.

### Step 8: Commit

```bash
git add src/components/LessonPlayer.tsx src/hooks/useLessonPlayer.ts src/data/chests.ts src/app/page.tsx src/data/locale/en.json src/data/locale/fi.json
git commit -m "feat: show chest opening as part of lesson completion flow

Chests now appear during the celebrate phase instead of only on
the journey map. Kids can't miss them."
```

---

## Task 2: Game Stuck-State Detection and Graceful Exit

When the kid's king is the only piece left, the opponent offers a friendly rematch instead of dragging on.

**Files:**
- Modify: `src/components/GamePlayer.tsx` — add stuck detection + nudge UI
- Modify: `src/data/locale/en.json` — add stuck-state narration
- Modify: `src/data/locale/fi.json` — Finnish translations
- Create: `src/lib/stuck-detection.ts` — pure function for detecting bare king

### Step 1: Create stuck detection utility

Create `src/lib/stuck-detection.ts`:

```typescript
import { Chess } from "chess.js";

/**
 * Returns true if the given side has only a king remaining.
 * This is the simplest, most unambiguous "stuck" signal for young kids.
 */
export function isBareKing(fen: string, color: "white" | "black"): boolean {
  const chess = new Chess(fen);
  const pieces = chess.board().flat().filter(
    (p) => p !== null && p.color === (color === "white" ? "w" : "b")
  );
  return pieces.length === 1 && pieces[0]!.type === "k";
}
```

### Step 2: Write a test for stuck detection

Create `src/lib/__tests__/stuck-detection.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { isBareKing } from "../stuck-detection";

describe("isBareKing", () => {
  it("returns true when white has only a king", () => {
    // White king on e1, black has king + queen + rook
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
});
```

### Step 3: Run test to verify it works

Run: `npx vitest run src/lib/__tests__/stuck-detection.test.ts`
Expected: 3 tests pass.

### Step 4: Add stuck-state UI to GamePlayer

In `src/components/GamePlayer.tsx`:

1. Import `isBareKing`
2. After each move, check if player (white) is bare king
3. When detected, show opponent character with speech bubble and "play again" button
4. Use voice narration to say the encouraging message

```typescript
// Add state:
const [showStuckNudge, setShowStuckNudge] = useState(false);

// After AI move completes (in the AI move useEffect), check:
useEffect(() => {
  if (turn === "white" && !gameOver.over && isBareKing(fen, "white")) {
    // Small delay so the kid sees the last capture happen
    const timer = setTimeout(() => {
      setShowStuckNudge(true);
      say("stuck_nudge");
    }, 1500);
    return () => clearTimeout(timer);
  }
}, [fen, turn, gameOver.over]);

// Render nudge overlay (similar structure to gameResult overlay):
{showStuckNudge && !gameResult && (
  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl animate-slide-in"
    style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(2px)" }}
  >
    <Image
      src={`/animals/${opponentImage}`}
      alt={opponentName}
      width={120}
      height={120}
      className="object-contain drop-shadow-lg"
    />
    <SpeechBubble text={t("stuck_nudge")} visible pointer="top" />
    <div className="flex gap-4 mt-4">
      <button onClick={handleRematch} className="btn-3d btn-3d-purple flex items-center gap-2 px-6 py-2.5">
        <Image src="/icons/icon-retry.webp" alt="" width={22} height={22} />
        <span>{t("rematch")}</span>
      </button>
      <button onClick={handleExit} className="btn-3d btn-3d-gray flex items-center gap-2 px-4 py-2.5">
        <Image src="/icons/icon-back.webp" alt="" width={22} height={22} />
      </button>
    </div>
  </div>
)}
```

### Step 5: Add locale keys

In `en.json`:
```json
"stuck_nudge": "Good game! Want to play again?"
```

In `fi.json`:
```json
"stuck_nudge": "Hyvä peli! Pelataan uudestaan?"
```

### Step 6: Add dismiss option

The kid might want to keep playing (even with just a king). Add a small "keep playing" tap area or let tapping outside the nudge dismiss it:

```typescript
// Add "keep going" as a third option but make it small/subtle:
<button
  onClick={() => setShowStuckNudge(false)}
  className="mt-2 text-sm text-gray-400 underline"
>
  {t("keep_playing")}
</button>
```

### Step 7: Build and verify

Run: `npm run build`
Manual test: Play against Fox, let Fox capture all your pieces except king. Verify nudge appears after ~1.5s with opponent image and play again button.

### Step 8: Commit

```bash
git add src/lib/stuck-detection.ts src/lib/__tests__/stuck-detection.test.ts src/components/GamePlayer.tsx src/data/locale/en.json src/data/locale/fi.json
git commit -m "feat: detect bare king and offer friendly rematch

When the kid loses all pieces except the king, the opponent
character appears with a 'play again' suggestion instead of
letting the game drag on endlessly."
```

---

## Task 3: Watch Phase Visual Distinction

Make watch vs try phases visually unmistakable. Add dimming during watch, feedback on taps, and a transition cue.

**Files:**
- Modify: `src/components/LessonPlayer.tsx` — add phase-specific styling and tap feedback
- Modify: `src/components/ChessBoard.tsx` — add watch-phase tap handler
- Modify: `src/components/NarrationArea.tsx` — update Piku expression for teaching
- Modify: `src/data/locale/en.json` — add "watch first" message
- Modify: `src/data/locale/fi.json` — Finnish translation

### Step 1: Add watch-phase tap feedback to ChessBoard

Currently `ChessBoard.tsx` silently ignores taps when `interactive` is false. Instead, call a new `onWatchTap` callback:

```typescript
// Add prop:
onWatchTap?: () => void;

// In handleSquareTap:
const handleSquareTap = useCallback(
  (square: Square) => {
    if (interactive) {
      onSquareTap(square);
    } else if (onWatchTap) {
      onWatchTap();
    }
  },
  [interactive, onSquareTap, onWatchTap]
);
```

### Step 2: Add wobble animation and "katso ensin" feedback in LessonPlayer

In `src/components/LessonPlayer.tsx`:

```typescript
const [watchTapFeedback, setWatchTapFeedback] = useState(false);

const handleWatchTap = useCallback(() => {
  if (watchTapFeedback) return; // debounce
  setWatchTapFeedback(true);
  say("watch_first");
  setTimeout(() => setWatchTapFeedback(false), 2000);
}, [watchTapFeedback, say]);

// Pass to ChessBoard:
<ChessBoard
  ...
  onWatchTap={state.phase === "watch" ? handleWatchTap : undefined}
/>

// Wrap the board in a container with phase-specific styling:
<div className={`relative transition-all duration-500 ${
  state.phase === "watch"
    ? "opacity-90"
    : "opacity-100"
} ${watchTapFeedback ? "animate-wobble" : ""}`}>
  <ChessBoard ... />
  {state.phase === "watch" && (
    <div className="absolute inset-0 pointer-events-none rounded-xl border-4 border-blue-300/40 animate-pulse" />
  )}
</div>
```

### Step 3: Add transition sound/visual between phases

When switching from watch → try:

```typescript
// In the useEffect that handles phase changes:
if (state.phase === "try" && prevPhaseRef.current === "watch") {
  sfx("button-tap"); // or a new "your-turn" sound
  // Could flash the board border green briefly
}
prevPhaseRef.current = state.phase;
```

### Step 4: Update Piku expression in NarrationArea

In `src/components/NarrationArea.tsx`, change watch phase expression from generic "happy" to "teaching":

```typescript
case "watch":
  return "standing-teaching" as const;  // Use teaching expression if available
```

Check if "standing-teaching" exists in Piku expressions. If not, use "standing-winking" or keep "happy" — verify available expressions first.

### Step 5: Add wobble animation to Tailwind config

Add to `tailwind.config.ts` (if not already present):

```typescript
keyframes: {
  wobble: {
    "0%, 100%": { transform: "rotate(0deg)" },
    "25%": { transform: "rotate(-2deg)" },
    "75%": { transform: "rotate(2deg)" },
  },
},
animation: {
  wobble: "wobble 0.3s ease-in-out",
},
```

### Step 6: Add locale keys

In `en.json`:
```json
"watch_first": "Watch first! It's Piku's turn to show you."
```

In `fi.json`:
```json
"watch_first": "Katso ensin! Pikun vuoro näyttää."
```

### Step 7: Build and verify

Run: `npm run build`
Manual test: Open a lesson. During watch phase, tap a piece — should see wobble + hear "katso ensin!" Advance to try phase — board should feel different (no blue border, full opacity, pieces pulse).

### Step 8: Commit

```bash
git add src/components/LessonPlayer.tsx src/components/ChessBoard.tsx src/components/NarrationArea.tsx src/data/locale/en.json src/data/locale/fi.json tailwind.config.ts
git commit -m "feat: make watch vs try phases visually distinct

Watch phase: blue pulsing border, slight dimming, tapping triggers
wobble + 'watch first!' voice feedback. Try phase: full brightness,
pieces feel tappable. Clear transition between phases."
```

---

## Task 4: Audio Replay Button

Add a replay button near the narration area so kids can re-hear instructions.

**Files:**
- Modify: `src/components/NarrationArea.tsx` — add replay button
- Modify: `src/components/LessonPlayer.tsx` — pass current narration key and replay handler
- Modify: `src/components/GamePlayer.tsx` — no change needed (game doesn't have narration to replay)

### Step 1: Add replay button to NarrationArea

In `src/components/NarrationArea.tsx`:

```typescript
interface NarrationAreaProps {
  narrationKey: string;
  phase: LessonPhase;
  onReplay?: () => void;  // NEW
}

// Add replay button next to speech bubble:
{onReplay && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onReplay();
    }}
    className="flex-shrink-0 p-2 active:scale-90 transition-transform"
    aria-label="Replay audio"
  >
    <Image
      src="/icons/icon-sound.webp"
      alt="Replay"
      width={36}
      height={36}
      className="object-contain drop-shadow-md"
    />
  </button>
)}
```

Check if `/icons/icon-sound.webp` exists. If not, we'll need to create or find a suitable speaker icon. Could also use an SVG inline as fallback.

### Step 2: Wire replay in LessonPlayer

In `src/components/LessonPlayer.tsx`:

```typescript
const handleReplay = useCallback(() => {
  if (state.phase === "watch" && currentStep) {
    say(currentStep.narrationKey);
  } else if (state.phase === "try" && currentPuzzle) {
    say(currentPuzzle.narrationKey);
  }
}, [state.phase, currentStep, currentPuzzle, say]);

// Pass to NarrationArea:
<NarrationArea
  narrationKey={currentNarrationKey}
  phase={state.phase}
  onReplay={handleReplay}
/>
```

### Step 3: Check for sound icon asset

Run: `ls public/icons/icon-sound*` to verify the icon exists. If not, create a simple speaker SVG inline in the component as fallback.

### Step 4: Build and verify

Run: `npm run build`
Manual test: Open a lesson, wait for narration to finish. Tap replay button — narration should replay. Works in both watch and try phases.

### Step 5: Commit

```bash
git add src/components/NarrationArea.tsx src/components/LessonPlayer.tsx
git commit -m "feat: add audio replay button to narration area

Kids can re-hear voice instructions by tapping the speaker icon
next to Piku's speech bubble. Works in both watch and try phases."
```

---

## Task 5: Clearer Game Over Screen

Redesign the game-end overlay with the opponent's face, voice message, and obvious action buttons.

**Files:**
- Modify: `src/components/GamePlayer.tsx` — redesign game result overlay
- Modify: `src/data/locale/en.json` — add opponent-specific game end messages
- Modify: `src/data/locale/fi.json` — Finnish translations

### Step 1: Redesign game result overlay

Replace the current emoji-based overlay with opponent character + clear actions.

In `src/components/GamePlayer.tsx`, replace the `gameResult` overlay block:

```typescript
{gameResult && (
  <div
    className="absolute inset-0 flex flex-col items-center justify-center rounded-xl animate-slide-in"
    style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(3px)" }}
  >
    {gameResult === "win" && <Confetti active />}

    {/* Opponent character */}
    <Image
      src={`/animals/${opponentImage}`}
      alt={opponentName}
      width={140}
      height={140}
      className="object-contain drop-shadow-lg mb-2"
    />

    {/* Speech bubble with result message */}
    <SpeechBubble
      text={t(
        gameResult === "win"
          ? "game_over_win"
          : gameResult === "loss"
            ? "game_over_loss"
            : "game_over_draw"
      )}
      visible
      pointer="top"
    />

    {/* Action buttons — big and obvious */}
    <div className="flex gap-4 mt-6">
      <button
        onClick={handleRematch}
        className="btn-3d btn-3d-purple flex items-center gap-2 px-8 py-3 text-white font-bold text-lg"
      >
        <Image src="/icons/icon-retry.webp" alt="" width={28} height={28} className="object-contain" />
        <span>{t("rematch")}</span>
      </button>
      <button
        onClick={handleExit}
        className="btn-3d btn-3d-gray p-3"
      >
        <Image src="/icons/icon-back.webp" alt="" width={28} height={28} className="object-contain" />
      </button>
    </div>
  </div>
)}
```

### Step 2: Ensure handleExit navigates correctly

Verify that there's a `handleExit` function that navigates back to the play lobby (not the journey map, per playtest notes). If it doesn't exist:

```typescript
const handleExit = useCallback(() => {
  sfx("button-tap");
  router.push("/play");
}, [sfx, router]);
```

### Step 3: Add locale keys for game-over messages

In `en.json`:
```json
"game_over_win": "You won! Amazing!",
"game_over_loss": "Good game! Want to try again?",
"game_over_draw": "It's a draw! Well played!"
```

In `fi.json`:
```json
"game_over_win": "Sinä voitit! Mahtavaa!",
"game_over_loss": "Hyvä peli! Haluatko yrittää uudestaan?",
"game_over_draw": "Tasapeli! Hyvin pelattu!"
```

### Step 4: Trigger voice on game over

Ensure the game result voice plays the new speech bubble message (not just the old terse keys):

```typescript
// In the gameOver useEffect, update the say() calls:
if (turn === "black") {
  setGameResult("win");
  sfx("confetti");
  say("game_over_win");
} else {
  setGameResult("loss");
  say("game_over_loss");
}
// For draw:
setGameResult("draw");
say("game_over_draw");
```

### Step 5: Build and verify

Run: `npm run build`
Manual test: Play a game against Mouse, win. Verify opponent image, speech bubble, big rematch + back buttons. Test loss and draw scenarios too.

### Step 6: Commit

```bash
git add src/components/GamePlayer.tsx src/data/locale/en.json src/data/locale/fi.json
git commit -m "feat: redesign game over screen with opponent face and clear actions

Replaces emoji-based overlay with opponent character, speech bubble
message, and obvious rematch/exit buttons. Voice narrates the result."
```

---

## Verification Checklist

After all 5 tasks are complete:

1. [ ] `npm run build` passes cleanly
2. [ ] `npx vitest run` passes (stuck-detection test)
3. [ ] Complete pawn lesson → chest modal appears in celebration → chest opened on map
4. [ ] Play game, lose all pieces → opponent nudge appears with voice
5. [ ] Lesson watch phase: tap piece → wobble + "katso ensin!" → try phase feels different
6. [ ] Tap replay button → narration replays
7. [ ] Win/lose/draw game → opponent face + speech bubble + clear buttons
