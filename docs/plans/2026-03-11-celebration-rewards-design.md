# Celebration & Reward System Overhaul

## Problem

The current reward system (board themes + piece colors from 5 chests) doesn't excite kids. Chest opening feels mechanical. Lesson completion transitions are abrupt. No special treatment for completing all lessons.

## Solution: Piku Outfit System + Enhanced Celebrations

### 1. Outfit System (Core Reward)

Kids unlock outfit items for Piku across two slots: **Head** and **Body**. Items are visible on the journey map and in a dedicated wardrobe screen. Mix-and-match combinations give kids ownership and expression.

#### Outfit Slots

- **Head**: Crown, helmet, wizard hat, pink bow, winter beanie, pirate hat, champion crown (special)
- **Body**: Red scarf, superhero cape, bow tie, knight armor vest, rainbow cape, snowflake vest, champion cape (special)

14 items total. Champion crown + cape are exclusive rewards for completing all 13 lessons.

#### Data Model

```typescript
interface OutfitItem {
  id: string;               // "crown", "wizard-hat", etc.
  slot: "head" | "body";
  nameKey: LocaleKey;       // "outfit_crown", etc.
  image: string;            // "/outfits/head-crown.webp"
}

// On ChildProfile (Firestore)
equippedOutfit: { head?: string; body?: string };
unlockedOutfits: string[];
```

#### Rendering Approach

Layered PNGs with CSS positioning. Standing Piku is the base layer, outfit items overlay on top with absolute positioning. Each item PNG is pre-positioned to align with standing Piku's head/body area.

#### Outfit Visibility

- Journey map (Piku walking along the path)
- Wardrobe screen (dedicated dress-up UI)
- Victory screens: future extension, not in this phase

### 2. Reward Sources

#### Journey Chests (increase from 5 to 8-10)

Primary outfit source. Each chest gives 1 outfit item. Some chests may also include a board theme or piece color alongside the outfit.

Proposed chest distribution:
- Chest 1 (4 stars): Winter beanie
- Chest 2 (8 stars): Red scarf
- Chest 3 (12 stars): Pink bow
- Chest 4 (16 stars): Superhero cape
- Chest 5 (20 stars): Knight helmet
- Chest 6 (24 stars): Bow tie + Ocean board theme
- Chest 7 (30 stars): Wizard hat
- Chest 8 (34 stars): Rainbow cape
- Chest 9 (37 stars): Pirate hat + Candy board theme
- Chest 10 (39 stars): Knight armor vest + Arctic board theme

Keep existing board themes and piece colors as bonus rewards in later chests.

#### Practice Milestones

Unlock 1-2 items for reaching puzzle-solving milestones per category (e.g., "Solve 10 pawn puzzles"). Future extension, not in this phase.

#### Play Victories

Unlock 1-2 items for beating each opponent multiple times. Future extension, not in this phase.

#### Final Lesson Completion

Champion crown + champion cape. Exclusive to completing all 13 lessons. The ultimate reward.

### 3. Improved Chest Opening Ceremony

5-phase animation replacing the current 4-phase:

1. **Anticipation** (0-800ms): Chest bounces in with shaking. Screen dims. Standing Piku appears beside chest looking excited.

2. **The Opening** (800-2000ms): Lid flies open with golden light burst. 20 sparkle particles (up from 12). Brief white flash.

3. **The Reveal** (2000-3500ms): Outfit item floats up from chest, large and center-stage, slowly rotating/bobbing. Full confetti burst. Piku bounces with excitement.

4. **The Try-On** (3500-5000ms): Item shrinks and flies to a Piku preview showing the item equipped. Kid sees the result. Piku does a celebration spin.

5. **Equip & Close** (5000ms+): Big colorful continue button. Item auto-equipped.

Key change: The reward is the HERO of the screen, shown large, then demonstrated on Piku.

### 4. Lesson Completion Flow

#### Celebrate Screen (in LessonPlayer)

After all puzzles solved:
- Bigger, more dramatic star reveal
- Full-body standing Piku (celebrating expression)
- Encouraging speech bubble from Piku
- Continue button leads back to map

#### Map Return Animation

1. Sparkle burst on completed lesson node
2. Piku "walks" from completed node to next node (CSS animation moving along path coordinates, ~1.5s)
3. Camera (scroll) follows Piku during the walk
4. New node unlocks with bounce/glow as Piku arrives

### 5. Final Lesson Celebration

When lesson 13 (Pins) is completed:

1. **Special celebrate screen**: Extra confetti, standing-celebrating Piku, unique message: "You completed all the lessons! You're a chess champion!"

2. **Map return**: Piku walks to the igloo with a sparkle trail behind. Igloo door glows.

3. **Grand reward**: Champion crown + champion cape unlock. Shown with the improved chest ceremony but even more dramatic (extra particles, bigger reveal).

4. **Teaser**: Piku winking with "More adventures coming soon!" Plants the seed for the second journey map.

### 6. Wardrobe Screen

Accessed from the journey map nav bar (new icon or replaces current character icon).

Layout:
- Left/center: Large Piku mannequin (standing-neutral) with equipped items layered on top
- Right/bottom: Item grid organized by slot (head tab, body tab)
- Each item: icon preview, tap to equip/unequip
- Locked items shown grayed out with source hint icon (chest, puzzle, opponent)

### 7. Assets to Create (ChatGPT Image Generation)

All items in cute 3D clay/vinyl style matching existing Piku art.

#### Outfit Items (14 transparent PNGs)

Head slot:
1. King's crown (gold with gems)
2. Knight helmet (medieval, silvery)
3. Wizard hat (starry purple/blue)
4. Pink bow (cute, oversized)
5. Winter beanie (cozy knit)
6. Pirate hat (fun tricorn)
7. Champion crown (golden laurel, special)

Body slot:
1. Red scarf (warm knitted)
2. Superhero cape (purple, flowing)
3. Bow tie (fancy red/gold)
4. Knight armor vest (silvery chest plate)
5. Rainbow cape (colorful, flowing)
6. Snowflake vest (icy blue pattern)
7. Champion cape (golden, special)

Generation approach: Create each item on Piku first to get correct positioning, then extract as overlay layer.

#### Celebration Art

- Piku wearing champion set (pre-composed for final celebration)
- "Chess Champion" badge/medal graphic

#### Wardrobe UI

- Slot indicator icons (hat icon + shirt icon) — can be SVGs
- Piku neutral base already exists (standing-neutral)

### 8. Implementation Phases

**Phase 1: Outfit Data & Wardrobe** (code-only, can start before assets)
- OutfitItem data model and types
- ChildProfile Firestore schema extension
- Wardrobe screen with placeholder items
- PikuWithOutfit component (layered rendering)

**Phase 2: Asset Integration** (after ChatGPT generation)
- Process outfit PNGs through image pipeline
- Map outfit positions to standing Piku coordinates
- Replace placeholders with real assets

**Phase 3: Chest Overhaul**
- Increase chests from 5 to 10
- New chest positions on journey map
- Redesigned ChestOpenModal with 5-phase ceremony
- Outfit reveal animation

**Phase 4: Journey Celebrations**
- Piku walking animation between lesson nodes
- Improved celebrate screen in LessonPlayer
- Final lesson special celebration
- Champion reward unlock flow

### 9. Existing Rewards

Board themes and piece colors are kept. They become secondary rewards bundled with some chests (chests 6, 9, 10). The RewardCollection screen is preserved but de-emphasized in favor of the wardrobe.
