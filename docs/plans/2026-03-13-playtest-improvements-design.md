# Playtest Improvements Design

Based on first kid playtest session (4yr4mo tester, ~55min session).

## Key playtest signals

- Core learning loop is the main attractor: lessons, stars, progression
- Kid replayed all content by creating new user — fast progression is the hook
- Voice narration is a genuine differentiator, kid listened and it guided her
- Chests/rewards went entirely unnoticed — disconnected from core flow
- Watch phases confused kid — tapped pieces during demos
- Game mode stalled when kid lost all pieces, no way out
- Content too short (~15min total), needs more repetition per concept
- Piku not relevant as companion yet — revisit later

## Priority 1: Usability & flow fixes

### 1a. Chests mandatory in lesson flow

Chest opening becomes part of lesson completion — not a separate map interaction.

- After completing the lesson that unlocks a chest, the chest appears as part of the celebration flow
- Kid taps the chest to open it (the best part)
- Rewards shown one by one, then back to map
- Chests on journey map show as already-opened after this
- No possibility of missing them

### 1b. Game stuck-state detection

Detect hopeless positions and offer a graceful exit.

- **Trigger:** Kid's bare king (only piece remaining) — clean, unambiguous
- **Response:** Opponent character appears with speech bubble + big "play again" button
- **Voice:** Opponent says encouraging line ("Good game! Want to play again?")
- **Kid can:** Tap "play again" for rematch, or tap back arrow to leave
- No chess jargon, no shame

### 1c. Watch phase visual distinction

Keep current watch/try structure but make the mode unmistakable.

- **Watch phase:** Subtle board overlay/dimming, pieces feel non-interactive, Piku in "teaching" pose, animated demo plays
- **Try phase:** Board lights up, moveable pieces pulse gently, encouraging Piku pose, transition sound cue
- **Tap during watch:** Board wobbles gently, Piku says "katso ensin!" / "watch first!" — acknowledges the tap instead of ignoring it

### 1d. Audio replay button

Simple speaker/replay icon visible during lessons and puzzles. Tapping replays the current step's narration. Always visible near the narration area.

### 1e. Game over screen clarity

Clearer game-end state with obvious actions — part of the stuck-state/game-end redesign. Big opponent face, result message via voice, prominent "play again" and "back" buttons.

## Priority 2: Content expansion

### Map 1 restructure

- Max 2 lessons per piece concept — keep fast progression momentum
- End Map 1 at check & checkmate (everything needed to play chess)
- Drop stalemate lesson from Map 1
- Target ~16-18 lessons (up from 11 usable)
- Each lesson: 2-3 demo steps + 3-4 puzzles (up from ~2)
- First lesson per piece: "meet the piece" (what it looks like, basic movement)
- Second lesson: captures, tactics, harder puzzles

### Map 1 rough structure

| Concept | Lessons | Notes |
|---------|---------|-------|
| Board intro | 1 | Light/dark squares |
| Pawn | 2 | Meet + movement; captures + first rank rule |
| Knight | 2 | Meet + L-shape; jumping + captures |
| Bishop | 2 | Meet + diagonals; captures |
| Rook | 2 | Meet + straight lines; captures |
| Queen | 2 | Meet + power; captures |
| King | 2 | Meet + movement; staying safe |
| Castling | 1 | Special move |
| En passant | 1 | Special capture |
| Promotion | 1 | Pawn reaches end |
| Check & Checkmate | 2 | What is check; deliver checkmate |

Total: ~18 lessons

### Map 2 (future, not this session)

Tactics, patterns, openings, stalemate, advanced concepts.

## Priority 3: Piku role — revisited later

Current narrator role works well. Voice narration is the standout UX feature. No changes to Piku's role now. Fix inappropriate celebrating in games when addressing game mode (Priority 1).

## Parked items (small polish, future)

- First-time onboarding clarity
- Journey map background too short on tall screens
- Finnish wording fixes ("uusi ruutu", "turvallinen ruutu")
- Puzzle star UI improvements
- Chest reward illustrations (currently chess pieces, rewards are outfits)
- User creation screen polish
- Piku celebrating any move in games (fix with game mode work)
