# Navigation & UI Button Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove bottom nav, add illustrated kawaii icon top bar on the journey map, and replace all Phosphor icon buttons with illustrated WebP icons throughout the app.

**Architecture:** The journey map (`/`) becomes the central hub with a top bar containing character, stars, practice, play, and settings buttons. All inner pages get a consistent Home button (map icon) top-left. Phosphor icon imports are removed in favor of `next/image` for illustrated WebP icons. A shared `NavIcon` component renders all icon buttons consistently.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, next/image

---

## Prerequisites

- All 12 icon WebPs are already in `public/icons/` (icon-home, icon-practice, icon-play, icon-settings, icon-character, icon-next, icon-back, icon-check, icon-retry, icon-close, icon-sound-on, icon-sound-off)
- Design doc: `docs/plans/2026-03-11-navigation-ui-redesign.md`

---

### Task 1: Create shared NavIcon component

**Files:**
- Create: `src/components/NavIcon.tsx`

**Step 1: Create the NavIcon component**

This is a reusable illustrated icon button used everywhere. Two sizes: `sm` (36px, for top bars) and `md` (44px, for journey map top bar).

```tsx
"use client";

import Image from "next/image";

interface NavIconProps {
  icon: string;          // filename in /icons/, e.g. "icon-home"
  alt: string;
  size?: "sm" | "md";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function NavIcon({
  icon,
  alt,
  size = "sm",
  onClick,
  className = "",
  disabled = false,
}: NavIconProps) {
  const px = size === "md" ? 44 : 36;
  const imgPx = size === "md" ? 32 : 24;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center rounded-full bg-white/70 backdrop-blur shadow-sm active:scale-95 transition-transform ${
        disabled ? "opacity-40" : ""
      } ${className}`}
      style={{ width: px, height: px }}
      aria-label={alt}
    >
      <Image
        src={`/icons/${icon}.webp`}
        alt={alt}
        width={imgPx}
        height={imgPx}
        className="object-contain"
        style={{ width: imgPx, height: "auto" }}
      />
    </button>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/NavIcon.tsx
git commit -m "feat: add NavIcon reusable illustrated icon button component"
```

---

### Task 2: Remove BottomNav

**Files:**
- Delete: `src/components/BottomNav.tsx`
- Modify: `src/app/layout.tsx` — remove BottomNav import and usage

**Step 1: Update layout.tsx**

Remove the BottomNav import (line 8) and the `<BottomNav />` usage (line 48). The layout should become:

```tsx
// Remove this import:
// import BottomNav from "@/components/BottomNav";

// Remove from JSX:
// <BottomNav />
```

After edit, the body should contain:
```tsx
<AuthProvider>
  <AudioProvider>
    {children}
  </AudioProvider>
</AuthProvider>
<ServiceWorkerRegistrar />
<ViewportHeightFix />
```

**Step 2: Delete BottomNav.tsx**

```bash
rm src/components/BottomNav.tsx
```

**Step 3: Remove pb-14 from journey map page**

In `src/app/page.tsx`, the main div has `pb-14` for bottom nav padding. Remove it:
```tsx
// Change:
<div className="relative min-h-dvh pb-14">
// To:
<div className="relative min-h-dvh">
```

**Step 4: Commit**

```bash
git add -u
git commit -m "feat: remove BottomNav — journey map becomes central hub"
```

---

### Task 3: Add top bar to journey map (page.tsx)

**Files:**
- Modify: `src/app/page.tsx`

This is the biggest change. Replace the current scattered top buttons (crown, gear, star counter, avatar) with a single top bar.

**Step 1: Add NavIcon import**

```tsx
import NavIcon from "@/components/NavIcon";
```

Remove Phosphor imports that are no longer needed:
```tsx
// Remove: import { GearSix, Crown } from "@phosphor-icons/react";
```

**Step 2: Replace the top overlay buttons**

Remove these three blocks (lines ~295-325):
- Top-left rewards + settings buttons
- Top-center star counter
- Top-right avatar button

Replace with a single top bar:

```tsx
{/* Top navigation bar */}
<div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-3 pt-[calc(env(safe-area-inset-top)+8px)] pb-2">
  {/* Left: character + star counter */}
  <div className="flex items-center gap-2">
    <NavIcon
      icon="icon-character"
      alt="My character"
      size="md"
      onClick={() => setActiveChild(null)}
    />
    <button
      onClick={() => setShowRewards(true)}
      className="flex items-center"
    >
      <StarCounter totalStars={totalStars} animate={justCompletedLesson !== null} />
    </button>
  </div>

  {/* Right: practice, play, settings */}
  <div className="flex items-center gap-2">
    <NavIcon
      icon="icon-practice"
      alt="Practice puzzles"
      size="md"
      onClick={() => router.push("/practice")}
    />
    <NavIcon
      icon="icon-play"
      alt="Play against opponents"
      size="md"
      onClick={() => router.push("/play")}
    />
    <NavIcon
      icon="icon-settings"
      alt="Settings"
      size="md"
      onClick={() => setShowSettings(true)}
    />
  </div>
</div>
```

**Step 3: Remove long-press settings handler**

Remove the `useLongPress` import and usage since settings is now a direct tap:
```tsx
// Remove: import { useLongPress } from "@/hooks/useLongPress";
// Remove: const openSettings = useCallback(() => setShowSettings(true), []);
// Remove: const longPressHandlers = useLongPress(openSettings);
```

**Step 4: Verify and commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add illustrated icon top bar to journey map"
```

---

### Task 4: Add Home button to practice and play hub pages

**Files:**
- Modify: `src/app/practice/page.tsx`
- Modify: `src/app/play/page.tsx`

**Step 1: Add Home button to practice page**

Add import and a top-left Home button before the existing content:
```tsx
import NavIcon from "@/components/NavIcon";
```

Add at the top of the page content:
```tsx
<div className="fixed top-4 left-4 z-30">
  <NavIcon icon="icon-home" alt="Back to map" onClick={() => router.push("/")} />
</div>
```

**Step 2: Add Home button to play page**

Same pattern — import NavIcon, add fixed top-left Home button.

**Step 3: Commit**

```bash
git add src/app/practice/page.tsx src/app/play/page.tsx
git commit -m "feat: add Home icon button to practice and play hub pages"
```

---

### Task 5: Replace Phosphor icons in LessonPlayer

**Files:**
- Modify: `src/components/LessonPlayer.tsx`

**Step 1: Replace imports**

```tsx
// Remove: import { House, ArrowRight } from "@phosphor-icons/react";
// Add:
import NavIcon from "@/components/NavIcon";
import Image from "next/image";
```

**Step 2: Replace House button**

Find the home button (uses `<House size={22} .../>` inside a card-pillow button) and replace with:
```tsx
<NavIcon icon="icon-home" alt="Back to map" onClick={() => router.push("/")} />
```

**Step 3: Replace ArrowRight in "Next" buttons**

Find the "Next" / "Continue" buttons that use `<ArrowRight>` inside `btn-3d` buttons. Replace the Phosphor icon with:
```tsx
<Image src="/icons/icon-next.webp" alt="" width={22} height={22} className="object-contain" />
```

Keep the btn-3d styling and text labels.

**Step 4: Commit**

```bash
git add src/components/LessonPlayer.tsx
git commit -m "feat: replace Phosphor icons with illustrated icons in LessonPlayer"
```

---

### Task 6: Replace Phosphor icons in PuzzlePlayer

**Files:**
- Modify: `src/components/PuzzlePlayer.tsx`

Same pattern as LessonPlayer:
- Replace `House` import → `NavIcon`
- Replace `ArrowRight` → illustrated icon-next.webp image
- Replace House button → `<NavIcon icon="icon-home" ...>`
- Replace ArrowRight in Continue button → `<Image src="/icons/icon-next.webp" ...>`

**Step 1: Apply replacements**

**Step 2: Commit**

```bash
git add src/components/PuzzlePlayer.tsx
git commit -m "feat: replace Phosphor icons with illustrated icons in PuzzlePlayer"
```

---

### Task 7: Replace Phosphor icons in GamePlayer

**Files:**
- Modify: `src/components/GamePlayer.tsx`

**Step 1: Replace imports**

```tsx
// Remove: import { House, ArrowCounterClockwise, Star } from "@phosphor-icons/react";
// Add:
import NavIcon from "@/components/NavIcon";
```

Note: `Star` from Phosphor is used for difficulty display — check if it's used inline or can be replaced. If Star is only used for difficulty dots, keep it or replace with a simple CSS star.

**Step 2: Replace House button**

Replace the home button with:
```tsx
<NavIcon icon="icon-home" alt="Back to opponents" onClick={handleExit} />
```

**Step 3: Replace rematch button icon**

Find the rematch button that uses `<ArrowCounterClockwise>` and replace with:
```tsx
<Image src="/icons/icon-retry.webp" alt="" width={22} height={22} className="object-contain" />
```

Keep the btn-3d-purple styling and text.

**Step 4: Commit**

```bash
git add src/components/GamePlayer.tsx
git commit -m "feat: replace Phosphor icons with illustrated icons in GamePlayer"
```

---

### Task 8: Replace close/X icons in modals

**Files:**
- Modify: `src/components/ParentSettings.tsx` — close button X
- Modify: `src/components/RewardCollection.tsx` — close button
- Modify: `src/components/ChestOpenModal.tsx` — if it has a close button
- Modify: `src/components/ChestPeekModal.tsx` — if it has a close button

**Step 1: Find all close buttons using Phosphor X**

Search for `X` from `@phosphor-icons/react` and replace with illustrated icon-close.webp:
```tsx
<Image src="/icons/icon-close.webp" alt="Close" width={20} height={20} className="object-contain" />
```

**Step 2: Replace sound toggle icons if present**

Search for `SpeakerHigh` / `SpeakerSlash` in settings and replace with icon-sound-on / icon-sound-off.

**Step 3: Commit**

```bash
git add -u
git commit -m "feat: replace Phosphor X and sound icons with illustrated icons in modals"
```

---

### Task 9: Add child profile switching to ParentSettings

**Files:**
- Modify: `src/components/ParentSettings.tsx`

Child profile switching already exists in ParentSettings (the "Players" section with avatar list and tap-to-switch). Per the design doc, the child avatar button on the journey map now leads to character customization (future), and child switching stays in settings.

**Step 1: Verify current state**

ParentSettings already has child profile list with tap-to-switch. The only change is:
- The avatar button on the journey map top bar now shows character (future: customization), NOT child-switch
- Settings keeps its child switching as-is

This task may be a no-op if settings already handles child switching properly. Verify and skip if nothing to change.

**Step 2: Commit if changes made**

---

### Task 10: Clean up unused Phosphor imports

**Files:**
- All files modified in previous tasks
- Check: `package.json` — if `@phosphor-icons/react` is no longer used anywhere, consider removing

**Step 1: Search for remaining Phosphor imports**

```bash
grep -r "@phosphor-icons/react" src/
```

For each remaining import, evaluate if it can be replaced with an illustrated icon or if it should stay (e.g., `Star` for rating display, `Lock` for locked states).

**Step 2: Remove unused imports**

**Step 3: Commit**

```bash
git add -u
git commit -m "chore: clean up unused Phosphor icon imports"
```

---

### Task 11: Visual testing and polish

**Step 1: Run dev server and test all navigation flows**

```bash
npm run dev
```

Test:
- [ ] Journey map top bar: all 5 buttons visible and functional
- [ ] Star counter tap → opens rewards
- [ ] Practice button → `/practice` page with Home button
- [ ] Play button → `/play` page with Home button
- [ ] Settings button → opens settings panel
- [ ] Character button → currently switches child (temporary)
- [ ] Lesson player: Home button, Next arrow icons
- [ ] Puzzle player: Home button, Continue arrow icon
- [ ] Game player: Home button, Rematch retry icon
- [ ] Modal close buttons use illustrated X icon
- [ ] No bottom nav visible anywhere
- [ ] Safe area insets work on mobile

**Step 2: Run build to catch type errors**

```bash
npm run build
```

**Step 3: Fix any issues found**

**Step 4: Final commit and push**

```bash
git add -u
git commit -m "polish: navigation redesign visual fixes"
git push
```
