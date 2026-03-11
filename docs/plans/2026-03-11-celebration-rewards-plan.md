# Celebration & Reward System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace boring board-theme/piece-color rewards with a Piku outfit system (head + body slots), redesign chest opening ceremony, add Piku walking animation on lesson completion, and create a special final-lesson celebration.

**Architecture:** Outfit items are transparent WebP overlays rendered on top of standing Piku via a new `PikuWithOutfit` component. Outfits are stored on `ChildProfile` in Firestore (`equippedOutfit`, `unlockedOutfits`). Chests increase from 5 to 10, primarily giving outfit items. A new Wardrobe screen lets kids mix-and-match. The chest opening modal gets a 5-phase animation with the outfit as hero. Journey map gets Piku walking animation between nodes.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Firestore, CSS keyframe animations

**Asset dependency:** Outfit PNG overlays must be created with ChatGPT image generation before Phase 2. Phase 1 uses placeholder colored rectangles. Phases 3-4 can proceed in parallel with asset creation.

---

## Phase 1: Outfit Data Model & Foundation

### Task 1: Extend Types

**Files:**
- Modify: `src/types/user.ts:16-30`
- Modify: `src/types/lesson.ts:44-52`

**Step 1: Add outfit types to lesson.ts**

Add `"outfit"` to `RewardType` union. Add `OutfitSlot` type and `OutfitItem` interface:

```typescript
export type RewardType = "board-theme" | "piece-color" | "outfit" | "celebration" | "sound-pack";

export type OutfitSlot = "head" | "body";

export interface OutfitItem {
  id: string;
  slot: OutfitSlot;
  nameKey: string;
  image: string;
}

// Add outfitId to Reward interface
export interface Reward {
  id: string;
  type: RewardType;
  chestIndex: number;
  themeId?: string;
  pieceColorId?: string;
  outfitId?: string;  // NEW
}
```

**Step 2: Extend ChildProfile in user.ts**

Add outfit fields:

```typescript
export interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
  currentLesson: string | number;
  totalStars: number;
  unlockedRewards: string[];
  activeBoardTheme: string;
  activePieceColor: string;
  equippedOutfit?: { head?: string; body?: string };  // NEW
  unlockedOutfits?: string[];                          // NEW
}
```

**Step 3: Commit**

```bash
git add src/types/user.ts src/types/lesson.ts
git commit -m "feat: add outfit types to data model"
```

---

### Task 2: Outfit Data File

**Files:**
- Create: `src/data/outfits.ts`

**Step 1: Create outfit definitions**

```typescript
import type { OutfitItem } from "@/types/lesson";

export const OUTFIT_ITEMS: OutfitItem[] = [
  // Head slot
  { id: "crown", slot: "head", nameKey: "outfit_crown", image: "/outfits/head-crown.webp" },
  { id: "knight-helmet", slot: "head", nameKey: "outfit_knight_helmet", image: "/outfits/head-knight-helmet.webp" },
  { id: "wizard-hat", slot: "head", nameKey: "outfit_wizard_hat", image: "/outfits/head-wizard-hat.webp" },
  { id: "pink-bow", slot: "head", nameKey: "outfit_pink_bow", image: "/outfits/head-pink-bow.webp" },
  { id: "winter-beanie", slot: "head", nameKey: "outfit_winter_beanie", image: "/outfits/head-winter-beanie.webp" },
  { id: "pirate-hat", slot: "head", nameKey: "outfit_pirate_hat", image: "/outfits/head-pirate-hat.webp" },
  { id: "champion-crown", slot: "head", nameKey: "outfit_champion_crown", image: "/outfits/head-champion-crown.webp" },

  // Body slot
  { id: "red-scarf", slot: "body", nameKey: "outfit_red_scarf", image: "/outfits/body-red-scarf.webp" },
  { id: "superhero-cape", slot: "body", nameKey: "outfit_superhero_cape", image: "/outfits/body-superhero-cape.webp" },
  { id: "bow-tie", slot: "body", nameKey: "outfit_bow_tie", image: "/outfits/body-bow-tie.webp" },
  { id: "knight-armor", slot: "body", nameKey: "outfit_knight_armor", image: "/outfits/body-knight-armor.webp" },
  { id: "rainbow-cape", slot: "body", nameKey: "outfit_rainbow_cape", image: "/outfits/body-rainbow-cape.webp" },
  { id: "snowflake-vest", slot: "body", nameKey: "outfit_snowflake_vest", image: "/outfits/body-snowflake-vest.webp" },
  { id: "champion-cape", slot: "body", nameKey: "outfit_champion_cape", image: "/outfits/body-champion-cape.webp" },
];

export function getOutfitItem(id: string): OutfitItem | undefined {
  return OUTFIT_ITEMS.find((item) => item.id === id);
}

export function getOutfitsBySlot(slot: "head" | "body"): OutfitItem[] {
  return OUTFIT_ITEMS.filter((item) => item.slot === slot);
}
```

**Step 2: Commit**

```bash
git add src/data/outfits.ts
git commit -m "feat: add outfit item definitions"
```

---

### Task 3: Extend Firestore Functions

**Files:**
- Modify: `src/lib/firestore.ts:93-100` (updateChildRewards)
- Modify: `src/lib/firestore.ts:30-39` (addChild)

**Step 1: Add outfit params to updateChildRewards**

```typescript
export async function updateChildRewards(
  uid: string,
  childId: string,
  rewards: string[],
  theme?: string,
  pieceColor?: string,
  outfitUnlocks?: string[],        // NEW: outfit IDs to add
  equippedOutfit?: { head?: string; body?: string }  // NEW
): Promise<void>
```

Add to the update object:
- If `outfitUnlocks` provided: `"unlockedOutfits": arrayUnion(...outfitUnlocks)`
- If `equippedOutfit` provided: `"equippedOutfit": equippedOutfit`

**Step 2: Initialize outfit fields in addChild**

Add to new child defaults:
```typescript
equippedOutfit: { head: null, body: null },
unlockedOutfits: [],
```

**Step 3: Commit**

```bash
git add src/lib/firestore.ts
git commit -m "feat: extend Firestore functions for outfit storage"
```

---

### Task 4: PikuWithOutfit Component

**Files:**
- Create: `src/components/PikuWithOutfit.tsx`

**Step 1: Create layered rendering component**

This component renders standing Piku with optional outfit overlays on top. Uses absolute positioning within a relative container. Each outfit item PNG is pre-positioned to align with Piku's head/body.

```typescript
"use client";

import Image from "next/image";

interface PikuWithOutfitProps {
  expression?: "standing-happy" | "standing-celebrating" | "standing-neutral" | "standing-winking";
  headItem?: string;   // outfit image path, e.g. "/outfits/head-crown.webp"
  bodyItem?: string;   // outfit image path
  size?: number;       // base Piku size in px
}
```

Renders:
- Relative container at `size` dimensions
- Base Piku image (standing expression) fills container
- Head overlay: absolutely positioned at top ~10% of container, centered horizontally
- Body overlay: absolutely positioned at ~35-55% of container height, centered

Position offsets may need per-item tuning — start with universal positions that work for most items, refine after assets are created.

**Step 2: Commit**

```bash
git add src/components/PikuWithOutfit.tsx
git commit -m "feat: add PikuWithOutfit layered rendering component"
```

---

### Task 5: Update Chest Data (5 → 10 Chests)

**Files:**
- Modify: `src/data/chests.ts`
- Modify: `src/components/JourneyMap.tsx` (CHEST_POSITIONS)

**Step 1: Redefine CHESTS array with 10 chests**

New distribution:
| Chest | Stars | Reward |
|-------|-------|--------|
| 0 | 4 | winter-beanie |
| 1 | 8 | red-scarf |
| 2 | 12 | pink-bow + forest theme |
| 3 | 16 | superhero-cape |
| 4 | 18 | knight-helmet + gold pieces |
| 5 | 22 | bow-tie + ocean theme |
| 6 | 26 | wizard-hat |
| 7 | 30 | rainbow-cape + rainbow-w pieces |
| 8 | 34 | pirate-hat + candy theme |
| 9 | 38 | knight-armor + arctic theme |

Champion items (crown + cape) are NOT in chests — unlocked by completing all 13 lessons.

**Step 2: Add 5 new hand-tuned chest positions to CHEST_POSITIONS in JourneyMap**

Place new chests between existing ones on alternating sides of the path. Reference the LESSON_POSITIONS coordinates to find good spots between lesson nodes.

**Step 3: Commit**

```bash
git add src/data/chests.ts src/components/JourneyMap.tsx
git commit -m "feat: expand to 10 chests with outfit rewards"
```

---

### Task 6: Locale Strings for Outfits

**Files:**
- Modify: `src/data/locale/en.json`
- Modify: `src/data/locale/fi.json`

**Step 1: Add outfit name keys and celebration strings**

English:
```json
"outfit_crown": "King's Crown",
"outfit_knight_helmet": "Knight's Helmet",
"outfit_wizard_hat": "Wizard Hat",
"outfit_pink_bow": "Pink Bow",
"outfit_winter_beanie": "Winter Beanie",
"outfit_pirate_hat": "Pirate Hat",
"outfit_champion_crown": "Champion Crown",
"outfit_red_scarf": "Red Scarf",
"outfit_superhero_cape": "Superhero Cape",
"outfit_bow_tie": "Bow Tie",
"outfit_knight_armor": "Knight's Armor",
"outfit_rainbow_cape": "Rainbow Cape",
"outfit_snowflake_vest": "Snowflake Vest",
"outfit_champion_cape": "Champion Cape",
"wardrobe_title": "Piku's Wardrobe",
"wardrobe_head": "Head",
"wardrobe_body": "Body",
"wardrobe_none": "None",
"wardrobe_locked": "Locked",
"celebrate_all_complete": "You completed all the lessons! You're a chess champion!",
"celebrate_champion_reward": "You earned the Champion Crown and Cape!",
"celebrate_more_coming": "More adventures coming soon!"
```

Finnish equivalents for all keys.

**Step 2: Commit**

```bash
git add src/data/locale/en.json src/data/locale/fi.json
git commit -m "feat: add outfit and celebration locale strings"
```

---

## Phase 2: Asset Integration

> **Blocked on:** ChatGPT image generation of outfit PNGs

### Task 7: Process Outfit Assets

**Files:**
- Create: `design/process_outfits.py`
- Create: `public/outfits/*.webp` (14 files)

**Step 1: Generate outfit PNGs with ChatGPT**

Prompt guidance for ChatGPT: Generate each item ON the standing Piku character in the same cute 3D clay/vinyl toy style. Transparent background. Then extract just the outfit item as a separate transparent PNG layer.

Items to generate (14 total): king's crown, knight helmet, wizard hat, pink bow, winter beanie, pirate hat, champion crown, red scarf, superhero cape, bow tie, knight armor vest, rainbow cape, snowflake vest, champion cape.

**Step 2: Write processing script**

Adapt `design/process_new_expressions.py` for outfit items. Same pipeline: flood-fill bg removal, trim, resize to fit within ~200x200px, save as WebP quality 80.

**Step 3: Run processing and verify all 14 items**

```bash
python3 design/process_outfits.py
ls public/outfits/
```

**Step 4: Tune PikuWithOutfit positions**

With real assets, adjust the head/body overlay positions in `PikuWithOutfit.tsx` to align correctly. May need per-item offsets stored in the outfit data.

**Step 5: Commit**

```bash
git add public/outfits/ design/process_outfits.py src/components/PikuWithOutfit.tsx
git commit -m "feat: add processed outfit assets and tune overlay positions"
```

---

## Phase 3: Wardrobe Screen

### Task 8: Wardrobe Component

**Files:**
- Create: `src/components/Wardrobe.tsx`

**Step 1: Build wardrobe screen**

Full-screen overlay (same pattern as RewardCollection). Layout:

- Header: "Piku's Wardrobe" title + close button
- Center: Large `PikuWithOutfit` preview (~200px) showing current equipped items
- Below: Two tab buttons (Head / Body slot icons)
- Grid: 3-column grid of outfit items for active tab
  - Unlocked: item preview, tap to equip. Active item has gold border.
  - Locked: grayscale, lock icon, source hint (chest icon)
  - "None" option to unequip slot

**Step 2: Wire up equip/unequip handlers**

On tap: update `equippedOutfit` in Firestore via extended `updateChildRewards`. Refresh child profile. Show brief sparkle animation on equip.

**Step 3: Commit**

```bash
git add src/components/Wardrobe.tsx
git commit -m "feat: add wardrobe screen with outfit selection"
```

---

### Task 9: Add Wardrobe to Navigation

**Files:**
- Modify: `src/app/page.tsx:293-332`
- Create: `public/icons/icon-wardrobe.webp` (or use existing icon)

**Step 1: Add wardrobe state and button**

Add `showWardrobe` state. Add wardrobe NavIcon button to the left nav group (next to character selector and star counter). On tap: `setShowWardrobe(true)`.

**Step 2: Render Wardrobe overlay**

Conditional render `<Wardrobe ... />` when `showWardrobe === true`. Pass: `activeChild`, `user`, `refreshChildren`, `onClose`.

**Step 3: Commit**

```bash
git add src/app/page.tsx public/icons/icon-wardrobe.webp
git commit -m "feat: add wardrobe button to journey map nav bar"
```

---

### Task 10: PikuWithOutfit on Journey Map

**Files:**
- Modify: `src/components/JourneyMap.tsx:300-317`

**Step 1: Replace Piku with PikuWithOutfit in map**

Pass `activeChild?.equippedOutfit?.head` and `activeChild?.equippedOutfit?.body` image paths to `PikuWithOutfit`. This requires passing the equipped outfit down from page.tsx → JourneyMap.

Add `equippedOutfit` prop to JourneyMapProps. Map outfit IDs to image paths using `getOutfitItem()`.

**Step 2: Commit**

```bash
git add src/components/JourneyMap.tsx src/app/page.tsx
git commit -m "feat: show equipped outfit on journey map Piku"
```

---

## Phase 4: Chest Opening Overhaul

### Task 11: Redesign ChestOpenModal

**Files:**
- Modify: `src/components/ChestOpenModal.tsx`
- Modify: `src/app/globals.css` (new keyframes)

**Step 1: Implement 5-phase animation**

Phase 1 (Anticipation, 0-800ms):
- Chest bounces in with glow (keep existing)
- Add standing Piku beside chest (excited expression)
- Screen dims with backdrop overlay

Phase 2 (Opening, 800-2000ms):
- Lid flies open with golden light burst (keep existing but enhance)
- 20 sparkle particles (up from 12)
- Brief white flash overlay (100ms)

Phase 3 (Reveal, 2000-3500ms):
- For outfit rewards: outfit item image floats up LARGE (180px), slowly rotating with CSS animation
- For theme/piece rewards: keep existing MiniBoardPreview / PieceColorPreview but bigger
- Full confetti burst
- Piku bounces with excitement (CSS transform animation)

Phase 4 (Try-On, 3500-5000ms):
- Outfit item shrinks and flies to PikuWithOutfit preview
- Piku preview shows the item equipped
- Celebration spin animation on Piku

Phase 5 (Close, 5000ms+):
- Big colorful continue button
- Item auto-equipped

**Step 2: Add new keyframes to globals.css**

```css
@keyframes outfit-float-up { /* item rises from chest, rotating */ }
@keyframes outfit-fly-to-piku { /* item shrinks and moves to preview */ }
@keyframes piku-bounce-excited { /* Piku jumps up and down */ }
@keyframes piku-spin-celebrate { /* Piku rotates 360 */ }
```

**Step 3: Update RewardCard for outfit type**

When reward type is "outfit": render the outfit item image large instead of MiniBoardPreview.

**Step 4: Commit**

```bash
git add src/components/ChestOpenModal.tsx src/app/globals.css
git commit -m "feat: redesign chest opening with 5-phase outfit reveal"
```

---

### Task 12: Auto-equip and Firestore Integration

**Files:**
- Modify: `src/app/page.tsx` (handleChestClose)

**Step 1: Update handleChestClose**

When a chest contains an outfit reward:
- Add outfit ID to `unlockedOutfits` via Firestore
- Auto-equip the outfit (update `equippedOutfit` for the appropriate slot)
- Pass both to `updateChildRewards`

Keep existing board-theme and piece-color handling for chests that include those.

**Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: auto-equip outfit rewards on chest open"
```

---

## Phase 5: Journey Celebrations

### Task 13: Piku Walking Animation

**Files:**
- Modify: `src/components/JourneyMap.tsx` (unlock animation sequence)
- Modify: `src/app/globals.css` (new keyframes)

**Step 1: Add walking state and animation**

In the unlock animation sequence (lines 132-182), add a "walking" phase between sparkle on completed node and unlock on new node:

1. (300ms) Sparkle on completed lesson
2. (1000ms) **NEW**: Animate Piku position from completed node coords to new node coords over 1.5s using CSS transition on `left`/`top` properties
3. Camera (scroll) follows Piku during walk by interpolating scroll position
4. (2500ms) New node unlocks with bounce/glow as Piku arrives

Use CSS `transition: left 1.5s ease-in-out, top 1.5s ease-in-out` on the Piku container, updating `left`/`top` via state.

**Step 2: Add walking keyframe for subtle bounce while moving**

```css
@keyframes piku-walk {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
```
Apply during walk transition: `animation: piku-walk 0.3s ease-in-out infinite`.

**Step 3: Commit**

```bash
git add src/components/JourneyMap.tsx src/app/globals.css
git commit -m "feat: add Piku walking animation between lesson nodes"
```

---

### Task 14: Improved Celebrate Screen

**Files:**
- Modify: `src/components/LessonPlayer.tsx:250-262`

**Step 1: Enhance celebrate phase**

- Replace bust `Piku` with full-body `standing-celebrating` (larger, ~160px)
- Add speech bubble with encouraging text from Piku
- Bigger star reveal with staggered pop animation per star
- More dramatic confetti (increase particle count)

**Step 2: Commit**

```bash
git add src/components/LessonPlayer.tsx
git commit -m "feat: enhance lesson completion celebrate screen"
```

---

### Task 15: Final Lesson Celebration

**Files:**
- Modify: `src/components/LessonPlayer.tsx` (detect final lesson)
- Create: `src/components/FinalCelebration.tsx`
- Modify: `src/app/page.tsx` (champion reward unlock)

**Step 1: Detect final lesson in LessonPlayer**

Check if current lesson is the last in LESSONS array. If so, show special celebration instead of normal one.

**Step 2: Create FinalCelebration component**

- Extra confetti (200 particles)
- Standing-celebrating Piku at large size
- Special message: "You completed all the lessons! You're a chess champion!"
- Champion crown + cape preview with dramatic reveal
- "More adventures coming soon!" teaser with Piku winking
- Continue button leads to map

**Step 3: Update page.tsx for champion reward**

When final lesson is completed (detected via URL params), auto-unlock champion-crown and champion-cape outfit items. Auto-equip both.

**Step 4: Journey map special animation**

Piku walks to igloo with sparkle trail. Igloo glows. This extends Task 13's walking animation for the special case.

**Step 5: Commit**

```bash
git add src/components/LessonPlayer.tsx src/components/FinalCelebration.tsx src/app/page.tsx src/components/JourneyMap.tsx
git commit -m "feat: add final lesson celebration with champion reward"
```

---

## Phase Summary

| Phase | Tasks | Dependencies | Can Start |
|-------|-------|-------------|-----------|
| 1: Data Model | Tasks 1-6 | None | Immediately |
| 2: Assets | Task 7 | ChatGPT image gen | After generating PNGs |
| 3: Wardrobe | Tasks 8-10 | Phase 1 + Phase 2 | After assets ready |
| 4: Chest Overhaul | Tasks 11-12 | Phase 1 + Phase 2 | After assets ready |
| 5: Celebrations | Tasks 13-15 | Phase 1 | Immediately (no asset dependency) |

**Recommended execution order:** Phase 1 → Phase 5 (no asset dependency) → Generate assets → Phase 2 → Phase 3 + Phase 4 in parallel.
