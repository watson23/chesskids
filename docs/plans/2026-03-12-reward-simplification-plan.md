# Reward System Simplification — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Revert to 5 hand-tuned treasure chests with outfit-only rewards, unlock all board themes and piece colors from the start, and add Stalemate as lesson 14.

**Architecture:** Data-layer changes to `chests.ts` and `lessons.ts`, UI simplification in `RewardCollection.tsx` to remove lock logic for themes/pieces, and JourneyMap position updates. Existing Firestore schema is unchanged — only the data definitions change.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS

---

### Task 1: Revert chests to original 5 with outfit rewards

**Files:**
- Modify: `src/data/chests.ts`

**Step 1: Replace the full CHESTS array**

Replace the entire contents of `src/data/chests.ts` with:

```typescript
import type { ChestDefinition } from "@/types/lesson";

export const CHESTS: ChestDefinition[] = [
  {
    index: 0,
    starsRequired: 6,
    rewards: [
      { id: "outfit-pink-bow", type: "outfit", chestIndex: 0, outfitId: "pink-bow" },
      { id: "outfit-blue-bow", type: "outfit", chestIndex: 0, outfitId: "blue-bow" },
    ],
    positionOnMap: 0.15,
  },
  {
    index: 1,
    starsRequired: 15,
    rewards: [
      { id: "outfit-mint-bow", type: "outfit", chestIndex: 1, outfitId: "mint-bow" },
      { id: "outfit-peach-bow", type: "outfit", chestIndex: 1, outfitId: "peach-bow" },
    ],
    positionOnMap: 0.35,
  },
  {
    index: 2,
    starsRequired: 24,
    rewards: [
      { id: "outfit-purple-bow", type: "outfit", chestIndex: 2, outfitId: "purple-bow" },
      { id: "outfit-gold-bow", type: "outfit", chestIndex: 2, outfitId: "gold-bow" },
    ],
    positionOnMap: 0.55,
  },
  {
    index: 3,
    starsRequired: 33,
    rewards: [
      { id: "outfit-wizard-hat", type: "outfit", chestIndex: 3, outfitId: "wizard-hat" },
    ],
    positionOnMap: 0.75,
  },
  {
    index: 4,
    starsRequired: 42,
    rewards: [
      { id: "outfit-medal-snowflake", type: "outfit", chestIndex: 4, outfitId: "medal-snowflake" },
    ],
    positionOnMap: 0.95,
  },
];
```

**Step 2: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds (no type errors from removing theme/piece rewards)

**Step 3: Commit**

```bash
git add src/data/chests.ts
git commit -m "feat: revert to 5 chests with outfit-only rewards"
```

---

### Task 2: Restore original 5 chest positions on JourneyMap

**Files:**
- Modify: `src/components/JourneyMap.tsx` (lines 71-82)

**Step 1: Replace CHEST_POSITIONS**

Replace the current 10-entry `CHEST_POSITIONS` object with the original 5 fine-tuned positions:

```typescript
const CHEST_POSITIONS: Record<number, { x: number; y: number }> = {
  0: { x: 72.5, y: 80.75 }, // 6★  — right side, on the chessboard circle
  1: { x: 22, y: 63.5 },    // 15★ — left side, between lessons 5-6
  2: { x: 60.75, y: 52.75 }, // 24★ — right side, between lessons 7-8
  3: { x: 22, y: 47 },      // 33★ — left side, between lessons 9-10
  4: { x: 77, y: 23 },      // 42★ — right side, near lessons 12-13
};
```

**Step 2: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/JourneyMap.tsx
git commit -m "feat: restore original 5 hand-tuned chest positions"
```

---

### Task 3: Unlock all board themes and piece colors

**Files:**
- Modify: `src/components/RewardCollection.tsx`

**Step 1: Remove lock helpers and simplify theme/piece rendering**

Delete the `getChestForReward` function (lines 25-36) and the `isRewardUnlocked` function (lines 39-52) entirely.

**Step 2: Simplify theme grid rendering**

In the boards section (around line 290), replace the theme button logic. Remove:
- `unlocked` variable and its `isRewardUnlocked` call
- `chest` variable and its `getChestForReward` call
- `disabled={!unlocked}` prop
- `opacity` and `filter` styles based on `unlocked`
- The entire lock overlay `{!unlocked && (...)}` block
- The `onClick` guard `unlocked &&`

The simplified theme button should be:

```tsx
{BOARD_THEMES.map((theme) => {
  const isActive = theme.id === activeThemeId;
  return (
    <button
      key={theme.id}
      onClick={() => selectTheme(theme)}
      className="relative flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all"
      style={{
        background: isActive ? "rgba(252, 211, 77, 0.15)" : "white",
        border: isActive ? "3px solid var(--ck-gold)" : "3px solid var(--ck-border)",
      }}
    >
      <MiniBoardPreview theme={theme} size="sm" />
      {isActive && (
        <div className="absolute -top-1.5 -right-1.5">
          <Image src="/icons/icon-check-circle.webp" alt="Active" width={24} height={24} className="object-contain" style={{ width: 24, height: "auto" }} />
        </div>
      )}
      <span className="text-[11px] font-bold" style={{ color: "var(--ck-text-light)" }}>
        {theme.name}
      </span>
    </button>
  );
})}
```

**Step 3: Simplify piece color grid rendering**

Same treatment for the piece colors section (around line 351). Remove all lock logic. Simplified:

```tsx
{PIECE_COLOR_SETS.map((colorSet) => {
  const isActive = colorSet.id === activePieceId;
  return (
    <button
      key={colorSet.id}
      onClick={() => selectPieceColor(colorSet)}
      className="relative flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all"
      style={{
        background: isActive ? "rgba(252, 211, 77, 0.15)" : "white",
        border: isActive ? "3px solid var(--ck-gold)" : "3px solid var(--ck-border)",
      }}
    >
      <PieceColorPreview colorSet={colorSet} size={36} />
      {isActive && (
        <div className="absolute -top-1.5 -right-1.5">
          <Image src="/icons/icon-check-circle.webp" alt="Active" width={24} height={24} className="object-contain" style={{ width: 24, height: "auto" }} />
        </div>
      )}
      <span className="text-[11px] font-bold" style={{ color: "var(--ck-text-light)" }}>
        {colorSet.name}
      </span>
    </button>
  );
})}
```

**Step 4: Remove the `isRewardUnlocked` guard from `selectTheme` and `selectPieceColor` callbacks**

In `selectTheme` (around line 106), remove: `if (!isRewardUnlocked("board-theme", theme.id, unlockedRewards)) return;`

In `selectPieceColor` (around line 131), remove: `if (!isRewardUnlocked("piece-color", colorSet.id, unlockedRewards)) return;`

**Step 5: Clean up unused import**

Remove `CHESTS` from the import at line 8: `import { CHESTS } from "@/data/chests";`

**Step 6: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds

**Step 7: Commit**

```bash
git add src/components/RewardCollection.tsx
git commit -m "feat: unlock all board themes and piece colors from start"
```

---

### Task 4: Update handleChestClose to save outfit unlocks

**Files:**
- Modify: `src/app/page.tsx` (lines 208-234)

**Step 1: Update the handleChestClose callback**

The current `handleChestClose` extracts `themeReward` and `pieceReward` from chest rewards. Since chests now only contain outfits, replace the reward-saving logic. Replace the `handleChestClose` callback:

```typescript
const handleChestClose = useCallback(() => {
  if (openChestIndex !== null && user && activeChild) {
    setOpenedChests((prev) =>
      prev.includes(openChestIndex) ? prev : [...prev, openChestIndex]
    );

    // Save rewards to Firestore
    const chest = CHESTS.find((c) => c.index === openChestIndex);
    if (chest) {
      const newRewardIds = chest.rewards.map((r) => r.id);
      const allRewards = [
        ...(activeChild.unlockedRewards ?? []),
        ...newRewardIds.filter((id) => !(activeChild.unlockedRewards ?? []).includes(id)),
      ];
      // Extract outfit IDs from chest rewards
      const outfitIds = chest.rewards
        .filter((r) => r.type === "outfit" && r.outfitId)
        .map((r) => r.outfitId!);
      updateChildRewards(
        user.uid, activeChild.id, allRewards,
        undefined, undefined, outfitIds
      ).then(() => refreshChildren()).catch((err) =>
        console.error("Failed to save rewards:", err)
      );
    }
  }
  setOpenChestIndex(null);
}, [openChestIndex, user, activeChild, refreshChildren]);
```

**Step 2: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: update chest close handler for outfit-only rewards"
```

---

### Task 5: Add Stalemate as lesson 12

**Files:**
- Modify: `src/data/lessons.ts`
- Modify: `src/components/JourneyMap.tsx` (LESSON_POSITIONS array)

**Step 1: Add stalemate lesson definition**

In `src/data/lessons.ts`, add a new lesson constant before the `forks` lesson. Insert after the `checkAndCheckmate` lesson definition:

```typescript
// ---------- 12. Stalemate ----------
const stalemate: Lesson = {
  id: "stalemate",
  icon: "special",
  steps: [
    {
      narrationKey: "stalemate_intro",
      boardSetup: pos(
        ["h1", "king", "white"],
        ["f2", "queen", "white"],
        ["h8", "king", "black"]
      ),
    },
    {
      narrationKey: "stalemate_trapped",
      boardSetup: pos(
        ["h1", "king", "white"],
        ["g6", "queen", "white"],
        ["h8", "king", "black"]
      ),
      animation: {
        piece: "h8" as Square,
        path: ["h8"] as Square[],
        highlights: ["g8", "g7", "h7"] as Square[],
      },
    },
  ],
  puzzles: [
    {
      narrationKey: "stalemate_puzzle_avoid",
      // White to move — avoid stalemate! Queen on f7, move somewhere that doesn't stalemate
      boardSetup: pos(
        ["g1", "king", "white"],
        ["f7", "queen", "white"],
        ["h8", "king", "black"]
      ),
      correctMoves: [
        { from: "f7" as Square, to: "f6" as Square },
        { from: "f7" as Square, to: "e7" as Square },
        { from: "f7" as Square, to: "g7" as Square },
      ],
      wrongMoveNarrationKey: "stalemate_oops",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "stalemate_puzzle_checkmate",
      // White to move — deliver checkmate, don't stalemate
      boardSetup: pos(
        ["f1", "king", "white"],
        ["e6", "queen", "white"],
        ["h8", "king", "black"]
      ),
      correctMoves: [
        { from: "e6" as Square, to: "g8" as Square },
      ],
      wrongMoveNarrationKey: "stalemate_oops",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};
```

**Step 2: Update the LESSONS export array**

Find the `export const LESSONS` array and insert `stalemate` after `checkAndCheckmate`:

```typescript
export const LESSONS: Lesson[] = [
  boardIntro,
  pawn,
  knight,
  bishop,
  rook,
  queen,
  king,
  castling,
  enPassant,
  promotion,
  checkAndCheckmate,
  stalemate,       // NEW — lesson 12
  forks,           // was 12, now 13
  pins,            // was 13, now 14
];
```

**Step 3: Add a 14th lesson position to JourneyMap**

In `src/components/JourneyMap.tsx`, update the `LESSON_POSITIONS` array. The current lesson 12 (Forks) position needs to become lesson 13, and a new position for Stalemate (lesson 12) needs to be inserted. Shift Forks down and add a new entry for lesson 14 (Pins):

```typescript
const LESSON_POSITIONS: { x: number; y: number }[] = [
  { x: 54, y: 93 },  // 1  Board Intro
  { x: 40, y: 87 },  // 2  Pawn
  { x: 35, y: 81 },  // 3  Knight
  { x: 42, y: 75 },  // 4  Bishop
  { x: 60, y: 69 },  // 5  Rook
  { x: 71, y: 63 },  // 6  Queen
  { x: 52, y: 57 },  // 7  King
  { x: 44, y: 51 },  // 8  Castling
  { x: 58, y: 45 },  // 9  En Passant
  { x: 72, y: 39 },  // 10 Promotion
  { x: 57, y: 33 },  // 11 Check & Checkmate
  { x: 42, y: 27 },  // 12 Stalemate (was Forks)
  { x: 44, y: 21 },  // 13 Forks (was Pins)
  { x: 30, y: 15 },  // 14 Pins (new — needs hand-tuning later)
];
```

Note: Lesson 14's position (`30, 15`) is a rough estimate. It will need hand-tuning against the background image.

**Step 4: Add locale keys for stalemate narrations**

Check `src/locales/en.json` and `src/locales/fi.json` and add the new keys. The exact narration text can be refined later, but the keys must exist for the build to pass. Add to both locale files:

English (`en.json`):
```json
"stalemate_intro": "Sometimes a game ends in a draw. This is called stalemate!",
"stalemate_trapped": "If it's a player's turn but they have no legal moves and are NOT in check — that's stalemate. The game is a draw!",
"stalemate_puzzle_avoid": "Be careful! Move the queen so the black king isn't stalemated.",
"stalemate_puzzle_checkmate": "Can you checkmate the king without causing a stalemate?",
"stalemate_oops": "Oops! That causes a stalemate. The king has no moves but isn't in check!",
"lesson_stalemate": "Stalemate"
```

Finnish (`fi.json`):
```json
"stalemate_intro": "Joskus peli päättyy tasapeliin. Sitä kutsutaan patiksi!",
"stalemate_trapped": "Jos on pelaajan vuoro, mutta hänellä ei ole yhtään laillista siirtoa eikä kuningas ole shakissa — se on patti. Peli on tasan!",
"stalemate_puzzle_avoid": "Ole tarkkana! Siirrä kuningatar niin, ettei musta kuningas joudu pattiin.",
"stalemate_puzzle_checkmate": "Osaatko antaa matin ilman, että syntyy patti?",
"stalemate_oops": "Hups! Tuo aiheuttaa patin. Kuninkaalla ei ole siirtoja, mutta se ei ole shakissa!",
"lesson_stalemate": "Patti"
```

**Step 5: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/data/lessons.ts src/components/JourneyMap.tsx src/locales/en.json src/locales/fi.json
git commit -m "feat: add Stalemate as lesson 12, shift Forks/Pins to 13-14"
```

---

### Task 6: Verify everything works end-to-end

**Step 1: Start the dev server**

Run: `npm run dev`

**Step 2: Visual verification checklist**

- [ ] Journey map shows 14 lesson nodes
- [ ] Journey map shows exactly 5 chests at the original positions
- [ ] RewardCollection shows all 8 board themes with no locks
- [ ] RewardCollection shows all 5 piece color sets with no locks
- [ ] Can switch themes and piece colors freely
- [ ] Stalemate appears as lesson 12 in the sequence
- [ ] Lesson 14 position doesn't overlap with igloo or other elements

**Step 3: Commit any position fixes**

If lesson 14's position needs adjustment, update `LESSON_POSITIONS[13]` in JourneyMap.tsx and commit.
