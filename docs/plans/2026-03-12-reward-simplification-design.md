# Reward System Simplification

## Summary

Simplify the reward system: revert to the original 5 hand-tuned treasure chests with outfit-only rewards, unlock all board themes and piece colors from the start, and add Stalemate as lesson 14.

## Chests

Revert to the original 5 chests at their fine-tuned map positions. Star thresholds use a consistent gap of 9.

| Chest | Stars | Position (x, y) | Rewards |
|-------|-------|------------------|---------|
| 0 | 6 | 72.5, 80.75 | Pink bow, Blue bow |
| 1 | 15 | 22, 63.5 | Mint bow, Peach bow |
| 2 | 24 | 60.75, 52.75 | Purple bow, Gold bow |
| 3 | 33 | 22, 47 | Wizard hat |
| 4 | 42 | 77, 23 | Medal snowflake |

Map completion reward (existing champion celebration flow): Crown.

## Board Themes & Piece Colors

All 8 board themes and all 5 piece color sets are unlocked from the start. No longer gated behind chests. Users can customize their board immediately.

## Lessons

Add Stalemate as lesson 12, shifting Forks and Pins to 13 and 14.

1. Board Intro
2. Pawn
3. Knight
4. Bishop
5. Rook
6. Queen
7. King
8. Castling
9. En Passant
10. Promotion
11. Check & Checkmate
12. **Stalemate** (new)
13. Forks
14. Pins

Stalemate lesson content TBD. Structural change (adding the lesson entry, updating positions, journey map) is in scope now.

## Files to Change

- `src/data/chests.ts` — revert to 5 chests with outfit rewards
- `src/data/lessons.ts` — add Stalemate as lesson 12
- `src/components/JourneyMap.tsx` — revert to 5 chest positions, add lesson 14 position
- `src/components/RewardCollection.tsx` — remove lock logic for themes/pieces
- `src/data/themes.ts` or equivalent — mark all themes/pieces as unlocked by default
- localStorage migration — users who already unlocked themes/pieces shouldn't lose state; users who had 10 chests opened need chest state reset to match the new 5-chest system
