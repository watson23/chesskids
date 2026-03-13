# Chest Opening Celebration Modal — Design

## Problem

The current chest opening modal uses a basic SVG-drawn chest and shows rewards as text cards ("Pink Bow (Body)"). Our users are 3-6 years old who can't read. The modal needs to be fully visual and use the illustrated assets we already have.

## Design

### Animation Phases

1. **Dark overlay + background** (300ms) — new celebration background fades in
2. **Chest bounces in** (600ms) — existing illustrated open chest image, centered, shaking with anticipation glow
3. **Chest opens + light burst** (800ms) — scale/glow animation, 12 sparkles burst outward, "chest-open" SFX
4. **First reward item rises** (500ms) — actual outfit image floats up large (~120px) above chest with golden shimmer, "confetti" SFX + 80 confetti particles
5. **Tap for next** (multi-item chests only) — current item shrinks to side, next item rises with fresh sparkles. Subtle pulsing glow indicates tappability (no text)
6. **Pikku reveal** (after last/single item, ~800ms) — Pikku slides up from bottom with celebrating expression, wearing the last item. Close button (X) appears.

### Visual Elements

- **Background:** New celebration illustration (purple/blue gradient, golden sparkles, aurora ribbons, misty glow)
- **Chest:** `icon-chest-open-left-side.webp`, centered, ~40% screen width
- **Reward items:** Actual outfit images displayed large, floating above chest
- **Pikku:** `pikku_celebrating.webp` with equipped outfit, appears at bottom
- **Effects:** Existing sparkle + confetti systems, golden glow behind reward items
- **No text anywhere** — fully visual for pre-readers

### Audio

- Phase 3: "chest-open" SFX (existing)
- Phase 4: "confetti" SFX (existing)

### New Assets Needed

- `bg-chest-celebration.webp` — celebration background (1024x1536, from new illustration)

### Reused Systems

- Sparkle system (12 sparkles, varied shapes)
- Confetti component (80 particles)
- Dark overlay click-to-close (final phase only)
- Firestore state management (openedChests, unlocked rewards)

### Chest Contents Reference

| Chest | Unlock After | Rewards |
|-------|-------------|---------|
| 0 | pawn | pink-bow, blue-bow |
| 1 | bishop | mint-bow, peach-bow |
| 2 | queen | purple-bow, gold-bow |
| 3 | en-passant | wizard-hat |
| 4 | stalemate | medal-snowflake |
