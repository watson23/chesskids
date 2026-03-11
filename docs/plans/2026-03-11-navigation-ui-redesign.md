# Navigation & UI Button Redesign

## Summary

Remove the bottom nav bar. Make the journey map the central hub with a top icon bar. Replace all Phosphor/text buttons with illustrated kawaii icon buttons throughout the app.

## Key Decisions

- **No bottom nav** — journey map is the hub, all sections reachable from top bar
- **Floating pill buttons** — soft rounded containers with illustrated icons, matching card-pillow style
- **No parent gate on settings** — freely accessible for now
- **Child profile switching** moves into settings
- **Character button** (top-left) leads to character customization view (future), shows current avatar for now
- **Star counter tap** opens Rewards Collection (removes separate crown button)
- **Consistent Home button** on all inner pages (replaces inconsistent back buttons)

## Journey Map Top Bar

```
[Character]  ⭐24   [Puzzle] [Play] [Settings]
```

- **Character** (left) — avatar pill, tap → character view (future: full creator)
- **Star counter** (center-left) — tap → Rewards Collection modal
- **Practice** (right) — puzzle icon pill → `/practice`
- **Play** (right) — swords icon pill → `/play`
- **Settings** (right) — gear icon pill → settings page/modal (sound, language, TTS, child profiles)

## Inner Page Navigation

All non-map pages get a top-left **Home button** (map scroll icon) → back to journey map.

| Page | Top-left | Center | Top-right |
|------|----------|--------|-----------|
| Practice | Home | Pikku + speech | — |
| Play | Home | Pikku + speech | — |
| Lesson player | Home | Progress | Sound toggle |
| Game player | Home | Opponent info | Sound toggle |
| Puzzle player | Home | Progress | Sound toggle |

## Illustrated Icon Buttons (12 images)

All: kawaii chibi style, thick outlines, soft pastels, transparent bg, 512x512.

| # | Name | File | Purpose |
|---|------|------|---------|
| 1 | Home/Map | icon-home.webp | Back to journey map |
| 2 | Practice/Puzzle | icon-practice.webp | Navigate to practice |
| 3 | Play/Battle | icon-play.webp | Navigate to play |
| 4 | Settings/Gear | icon-settings.webp | Open settings |
| 5 | Character/Profile | icon-character.webp | Character customization |
| 6 | Next Arrow | icon-next.webp | Forward in lessons/modals |
| 7 | Back Arrow | icon-back.webp | Back in lesson slides |
| 8 | Checkmark/Done | icon-check.webp | Success confirmation |
| 9 | Retry/Redo | icon-retry.webp | Try again |
| 10 | Close/X | icon-close.webp | Close modals/overlays |
| 11 | Sound On | icon-sound-on.webp | Sound enabled |
| 12 | Sound Off | icon-sound-off.webp | Sound muted |

## Button Styling

- **Navigation icons:** Illustrated WebP (40-48px) inside soft white pill with subtle shadow
- **Action buttons:** Illustrated icon + optional text, using .btn-3d press style
- **Color tinting:** Subtle background tint per section (purple=map, blue=practice, pink=play)

## Files to Modify

| File | Change |
|------|--------|
| `src/components/BottomNav.tsx` | Delete |
| `src/app/layout.tsx` | Remove BottomNav |
| `src/components/JourneyMap.tsx` | Replace top overlay buttons with new top bar |
| `src/app/page.tsx` | Remove crown/gear/avatar buttons, add top bar |
| `src/app/practice/page.tsx` | Add Home button top bar |
| `src/app/play/page.tsx` | Add Home button top bar |
| `src/components/LessonPlayer.tsx` | Replace back button with Home icon |
| `src/components/GamePlayer.tsx` | Replace back button with Home icon |
| `src/components/PuzzlePlayer.tsx` | Replace back button with Home icon |
| `src/components/ParentSettings.tsx` | Add child profile switching, remove parent gate |
| `src/app/globals.css` | Add nav-pill button styles |
| `public/icons/` | 12 new illustrated icon WebPs |

## Image Pipeline

ChatGPT generates PNGs → `design/` folder → process to WebP (transparent bg) → `public/icons/`
