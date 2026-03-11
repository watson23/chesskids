# Outfit Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let kids equip outfits on Piku and see them on the journey map, celebration screens, and a new outfit picker in the rewards screen.

**Architecture:** Add a Firestore helper `updateEquippedOutfit` to save head/body selections. Create a new `AVAILABLE_OUTFITS` filtered list of outfits with real images. Add an outfits section to the existing `RewardCollection` component with a live Piku preview. Replace `Piku` with `PikuWithOutfit` on the journey map and celebration screen, reading `equippedOutfit` from the active child profile.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Firebase Firestore, React state

---

### Task 1: Add Firestore helper for equipping outfits

**Files:**
- Modify: `src/lib/firestore.ts`

**Step 1: Add `updateEquippedOutfit` function**

Add at the end of `src/lib/firestore.ts`:

```typescript
export async function updateEquippedOutfit(
  uid: string,
  childId: string,
  equippedOutfit: { head?: string; body?: string }
): Promise<void> {
  const db = getDb();
  const ref = doc(db, "users", uid, "children", childId);
  await updateDoc(ref, { equippedOutfit });
}
```

**Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/lib/firestore.ts
git commit -m "feat: add updateEquippedOutfit Firestore helper"
```

---

### Task 2: Create filtered available outfits list

The `ALL_OUTFITS` in `src/data/outfits.ts` contains items without real images. We need a filtered list of only the outfits that have actual images in `public/outfits/`.

**Files:**
- Modify: `src/data/outfits.ts`

**Step 1: Add available outfits constant and bow color locale keys**

The existing `ALL_OUTFITS` has items like `knight-helmet`, `pirate-hat` etc. with no real images. Add a new constant listing only the ones with working images. Also add new outfit entries for the bow color variants and the snowflake medal, which exist as images but aren't in `ALL_OUTFITS` yet.

Add after the existing `getOutfitsBySlot` function:

```typescript
/**
 * Outfits that have real images and working PikuWithOutfit positioning.
 * This is the list shown in the outfit picker UI.
 */
export const AVAILABLE_OUTFITS: OutfitItem[] = [
  // Head
  { id: "crown", slot: "head", nameKey: "outfit_crown", image: "/outfits/head-crown.webp" },
  { id: "wizard-hat", slot: "head", nameKey: "outfit_wizard_hat", image: "/outfits/head-wizard-hat.webp" },
  // Body
  { id: "pink-bow", slot: "body", nameKey: "outfit_pink_bow", image: "/outfits/body-pink-bow.webp" },
  { id: "purple-bow", slot: "body", nameKey: "outfit_purple_bow", image: "/outfits/body-purple-bow.webp" },
  { id: "blue-bow", slot: "body", nameKey: "outfit_blue_bow", image: "/outfits/body-blue-bow.webp" },
  { id: "mint-bow", slot: "body", nameKey: "outfit_mint_bow", image: "/outfits/body-mint-bow.webp" },
  { id: "gold-bow", slot: "body", nameKey: "outfit_gold_bow", image: "/outfits/body-gold-bow.webp" },
  { id: "peach-bow", slot: "body", nameKey: "outfit_peach_bow", image: "/outfits/body-peach-bow.webp" },
  { id: "medal-snowflake", slot: "body", nameKey: "outfit_medal_snowflake", image: "/outfits/body-medal-snowflake.webp" },
];

export function getAvailableBySlot(slot: OutfitSlot): OutfitItem[] {
  return AVAILABLE_OUTFITS.filter((item) => item.slot === slot);
}
```

**Step 2: Add missing locale keys**

In `src/data/locale/en.json`, add these keys (after existing outfit keys):

```json
"outfit_purple_bow": "Purple Bow",
"outfit_blue_bow": "Blue Bow",
"outfit_mint_bow": "Mint Bow",
"outfit_gold_bow": "Gold Bow",
"outfit_peach_bow": "Peach Bow",
"outfit_medal_snowflake": "Snowflake Medal",
```

In `src/data/locale/fi.json`, add:

```json
"outfit_purple_bow": "Violetti rusetti",
"outfit_blue_bow": "Sininen rusetti",
"outfit_mint_bow": "Minttu rusetti",
"outfit_gold_bow": "Kultainen rusetti",
"outfit_peach_bow": "Persikka rusetti",
"outfit_medal_snowflake": "Lumihiutalemitali",
```

**Step 3: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/data/outfits.ts src/data/locale/en.json src/data/locale/fi.json
git commit -m "feat: add AVAILABLE_OUTFITS list and bow/medal locale keys"
```

---

### Task 3: Add outfit picker section to RewardCollection

**Files:**
- Modify: `src/components/RewardCollection.tsx`

**Step 1: Add imports**

Add to the top of `RewardCollection.tsx`:

```typescript
import PikuWithOutfit from "@/components/PikuWithOutfit";
import { getAvailableBySlot } from "@/data/outfits";
import { updateEquippedOutfit } from "@/lib/firestore";
import { useLocale } from "@/hooks/useLocale";
```

**Step 2: Add outfit state and handler**

Inside the `RewardCollection` component function, after the existing `activePieceId` line, add:

```typescript
const { t } = useLocale();
const equippedOutfit = activeChild?.equippedOutfit ?? {};
const [previewOutfit, setPreviewOutfit] = useState<{ head?: string; body?: string }>(equippedOutfit);

// Sync preview when activeChild changes (e.g. after refresh)
useEffect(() => {
  setPreviewOutfit(activeChild?.equippedOutfit ?? {});
}, [activeChild?.equippedOutfit]);

const headOutfits = getAvailableBySlot("head");
const bodyOutfits = getAvailableBySlot("body");

const toggleOutfit = useCallback(
  async (slot: "head" | "body", image: string | undefined) => {
    if (!user || !activeChild || saving) return;
    sfx("button-tap");

    const next = { ...previewOutfit };
    if (image && next[slot] === image) {
      // Unequip — tapped the already-equipped item
      delete next[slot];
    } else if (image) {
      next[slot] = image;
    } else {
      // "None" button
      delete next[slot];
    }
    setPreviewOutfit(next);

    setSaving(true);
    try {
      await updateEquippedOutfit(user.uid, activeChild.id, next);
      await refreshChildren();
    } catch (err) {
      console.error("Failed to update outfit:", err);
    }
    setSaving(false);
  },
  [user, activeChild, previewOutfit, sfx, saving, refreshChildren]
);
```

Add `useEffect` to the imports from React at the top:

```typescript
import { useCallback, useState, useEffect } from "react";
```

**Step 3: Add outfit section JSX**

Insert the outfits section at the top of the scrollable content div (before the "Boards section" comment). This goes right after `<div className="overflow-y-auto px-4 pb-8" style={{ height: "calc(100dvh - 60px)" }}>`:

```tsx
{/* Outfits section */}
<div className="mb-8">
  {/* Piku preview */}
  <div className="flex justify-center mb-4">
    <PikuWithOutfit
      expression="standing-happy"
      headImage={previewOutfit.head}
      bodyImage={previewOutfit.body}
      size={160}
    />
  </div>

  {/* Head outfits */}
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-sm font-extrabold" style={{ color: "var(--ck-text)" }}>
        {t("wardrobe_head")}
      </span>
    </div>
    <div className="flex gap-2 overflow-x-auto pb-2">
      {/* None button */}
      <button
        onClick={() => toggleOutfit("head", undefined)}
        className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
        style={{
          border: !previewOutfit.head
            ? "3px solid var(--ck-gold)"
            : "3px solid var(--ck-border)",
          background: !previewOutfit.head
            ? "rgba(252, 211, 77, 0.15)"
            : "white",
        }}
      >
        <span className="text-lg">✕</span>
      </button>
      {headOutfits.map((item) => {
        const isEquipped = previewOutfit.head === item.image;
        return (
          <button
            key={item.id}
            onClick={() => toggleOutfit("head", item.image)}
            className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center relative overflow-hidden"
            style={{
              border: isEquipped
                ? "3px solid var(--ck-gold)"
                : "3px solid var(--ck-border)",
              background: isEquipped
                ? "rgba(252, 211, 77, 0.15)"
                : "white",
            }}
          >
            <Image
              src={item.image}
              alt={t(item.nameKey)}
              width={40}
              height={40}
              className="object-contain"
              style={{ width: 40, height: "auto" }}
            />
          </button>
        );
      })}
    </div>
  </div>

  {/* Body outfits */}
  <div>
    <div className="flex items-center gap-2 mb-2">
      <span className="text-sm font-extrabold" style={{ color: "var(--ck-text)" }}>
        {t("wardrobe_body")}
      </span>
    </div>
    <div className="flex gap-2 overflow-x-auto pb-2">
      {/* None button */}
      <button
        onClick={() => toggleOutfit("body", undefined)}
        className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
        style={{
          border: !previewOutfit.body
            ? "3px solid var(--ck-gold)"
            : "3px solid var(--ck-border)",
          background: !previewOutfit.body
            ? "rgba(252, 211, 77, 0.15)"
            : "white",
        }}
      >
        <span className="text-lg">✕</span>
      </button>
      {bodyOutfits.map((item) => {
        const isEquipped = previewOutfit.body === item.image;
        return (
          <button
            key={item.id}
            onClick={() => toggleOutfit("body", item.image)}
            className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center relative overflow-hidden"
            style={{
              border: isEquipped
                ? "3px solid var(--ck-gold)"
                : "3px solid var(--ck-border)",
              background: isEquipped
                ? "rgba(252, 211, 77, 0.15)"
                : "white",
            }}
          >
            <Image
              src={item.image}
              alt={t(item.nameKey)}
              width={40}
              height={40}
              className="object-contain"
              style={{ width: 40, height: "auto" }}
            />
          </button>
        );
      })}
    </div>
  </div>
</div>
```

**Step 4: Verify in browser**

Run dev server, navigate to home, open rewards screen. Outfit section should appear at top with Piku preview, head row (none + crown + wizard-hat), body row (none + 6 bows + medal). Tapping should update preview and save.

**Step 5: Commit**

```bash
git add src/components/RewardCollection.tsx
git commit -m "feat: add outfit picker section to rewards screen"
```

---

### Task 4: Show equipped outfit on journey map

**Files:**
- Modify: `src/components/JourneyMap.tsx`

**Step 1: Update JourneyMap props and imports**

Replace the `Piku` import with `PikuWithOutfit`:

```typescript
// Remove: import Piku from "@/components/Piku";
import PikuWithOutfit from "@/components/PikuWithOutfit";
```

Add to `JourneyMapProps` interface:

```typescript
equippedOutfit?: { head?: string; body?: string };
```

Add `equippedOutfit` to the destructured props in the function signature.

**Step 2: Replace Piku with PikuWithOutfit**

Find the line (around line 375):

```tsx
<Piku expression={allDone ? "standing-celebrating" : "standing-happy"} size={72} />
```

Replace with:

```tsx
<PikuWithOutfit
  expression={allDone ? "standing-celebrating" : "standing-happy"}
  headImage={equippedOutfit?.head}
  bodyImage={equippedOutfit?.body}
  size={72}
/>
```

**Step 3: Pass equippedOutfit from home page**

In `src/app/page.tsx`, find where `<JourneyMap` is rendered and add the `equippedOutfit` prop:

```tsx
equippedOutfit={activeChild?.equippedOutfit}
```

**Step 4: Verify in browser**

Equip an outfit in rewards, close rewards, see Piku on journey map wearing it.

**Step 5: Commit**

```bash
git add src/components/JourneyMap.tsx src/app/page.tsx
git commit -m "feat: show equipped outfit on journey map Piku"
```

---

### Task 5: Show equipped outfit on celebration screen

**Files:**
- Modify: `src/components/FinalCelebration.tsx`

**Step 1: Update imports and props**

Replace `Piku` import with `PikuWithOutfit`:

```typescript
// Remove: import Piku from "@/components/Piku";
import PikuWithOutfit from "@/components/PikuWithOutfit";
```

Add to `FinalCelebrationProps`:

```typescript
equippedOutfit?: { head?: string; body?: string };
```

Destructure it in the function signature.

**Step 2: Replace Piku instances**

Replace the large celebrating Piku (line 54):

```tsx
// Before:
<Piku expression="standing-celebrating" size={200} />
// After:
<PikuWithOutfit expression="standing-celebrating" headImage={equippedOutfit?.head} bodyImage={equippedOutfit?.body} size={200} />
```

Replace the small winking Piku (line 77):

```tsx
// Before:
<Piku expression="standing-winking" size={80} />
// After:
<PikuWithOutfit expression="standing-winking" headImage={equippedOutfit?.head} bodyImage={equippedOutfit?.body} size={80} />
```

**Step 3: Pass equippedOutfit from parent**

Find where `<FinalCelebration` is rendered (in `src/app/page.tsx` or the lesson completion flow) and pass the prop:

```tsx
equippedOutfit={activeChild?.equippedOutfit}
```

**Step 4: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/components/FinalCelebration.tsx src/app/page.tsx
git commit -m "feat: show equipped outfit on celebration screen"
```

---

### Task 6: Final verification

**Step 1: Run full build**

```bash
npm run build
```

Expected: Clean build, no errors.

**Step 2: Manual testing checklist**

1. Open rewards screen → outfit section shows at top
2. Tap crown → Piku preview shows crown
3. Tap pink bow → Piku shows crown + bow
4. Tap crown again → crown removed, only bow
5. Tap "none" in body row → bow removed
6. Close rewards → journey map Piku wears equipped outfit
7. Complete a lesson → celebration Piku wears equipped outfit
8. Refresh page → outfit persists (Firestore)

**Step 3: Commit any final fixes**

```bash
git add -A
git commit -m "feat: outfit integration complete"
```

---

## Files Modified Summary

| File | Change |
|------|--------|
| `src/lib/firestore.ts` | Add `updateEquippedOutfit` function |
| `src/data/outfits.ts` | Add `AVAILABLE_OUTFITS` list and `getAvailableBySlot` |
| `src/data/locale/en.json` | Add bow color + medal locale keys |
| `src/data/locale/fi.json` | Add bow color + medal locale keys |
| `src/components/RewardCollection.tsx` | Add outfit picker section with Piku preview |
| `src/components/JourneyMap.tsx` | Replace Piku with PikuWithOutfit, add equippedOutfit prop |
| `src/components/FinalCelebration.tsx` | Replace Piku with PikuWithOutfit, add equippedOutfit prop |
| `src/app/page.tsx` | Pass equippedOutfit to JourneyMap and FinalCelebration |
