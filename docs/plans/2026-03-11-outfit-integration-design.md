# Outfit Integration Design

## Goal

Let kids equip outfits on Piku and see them in the app — on the journey map, celebration screens, and the outfit picker.

## Decisions

- **All outfits unlocked** — no gating for now. Unlock system layered on later.
- **Only real outfits** — crown, wizard-hat, 6 bow colors, snowflake medal. No placeholders.
- **Piku removes accessories indoors** — outfits only show on standing expressions (journey map, celebrations, picker). Lessons/practice use bare Piku. Lore: Piku is polite and takes his hat off inside.

## Available Outfits

| Slot | Items |
|------|-------|
| Head | crown, wizard-hat |
| Body | pink-bow, purple-bow, blue-bow, mint-bow, gold-bow, peach-bow, snowflake-medal |

## Data & State

- **Firestore path:** `users/{uid}/children/{childId}.equippedOutfit: { head?: string, body?: string }`
- Values are image paths like `/outfits/head-crown.webp`
- Read via `useAuth` → active child doc
- Write via `updateDoc` on equip/unequip

## Outfit Picker (in Rewards Screen)

- Add outfits section to existing `RewardCollection` page
- Large preview Piku (200px, standing-happy) at top wearing current outfit
- Two rows: "Head" and "Body", each with horizontal scrollable item grid
- Each item ~60px thumbnail with colored ring when equipped
- First item in each row: "none" (clear slot)
- Tap to equip → instant preview + auto-save to Firestore
- Tap equipped item to unequip
- Subtle bounce animation on equipped item

## Showing Outfits in App

### Journey Map
- Replace `Piku` with `PikuWithOutfit` on the journey map
- Pass `headImage`/`bodyImage` from `equippedOutfit`
- Same expressions as before (happy, celebrating during unlock)

### Celebration Screens (FinalCelebration)
- 200px celebrating Piku → `PikuWithOutfit` with equipped outfit
- 80px winking Piku → `PikuWithOutfit` with equipped outfit

### Not Changing (for now)
- NarrationArea (lessons) — non-standing expressions
- Practice/Play pages — same reason
- Future idea: hat shelf or hanger showing Piku's accessories in lesson room
