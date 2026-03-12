import type { PuzzleDefinition } from "@/types/lesson";
import type { Square, ChessPiece } from "@/types/chess";

// Helper to build board setup from piece list
function board(
  ...pieces: [Square, ChessPiece][]
): Record<Square, ChessPiece> {
  const setup: Partial<Record<Square, ChessPiece>> = {};
  for (const [sq, piece] of pieces) {
    setup[sq] = piece;
  }
  return setup as Record<Square, ChessPiece>;
}

const w = (type: ChessPiece["type"]): ChessPiece => ({
  type,
  color: "white",
});
const b = (type: ChessPiece["type"]): ChessPiece => ({
  type,
  color: "black",
});

// ─── PAWN PUZZLES ────────────────────────────────────────────────────────────

const pawnPuzzles: PuzzleDefinition[] = [
  {
    id: "pawn-move-1",
    category: "pawn",
    difficulty: 1,
    narrationKey: "puzzle_pawn_move_1",
    boardSetup: board(["e2", w("pawn")]),
    correctMoves: [{ from: "e2" as Square, to: "e4" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "great_move",
  },
  {
    id: "pawn-move-2",
    category: "pawn",
    difficulty: 1,
    narrationKey: "puzzle_pawn_move_2",
    boardSetup: board(["d4", w("pawn")]),
    correctMoves: [{ from: "d4" as Square, to: "d5" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "great_move",
  },
  {
    id: "pawn-capture-1",
    category: "pawn",
    difficulty: 2,
    narrationKey: "puzzle_pawn_capture",
    boardSetup: board(["e4", w("pawn")], ["d5", b("pawn")]),
    correctMoves: [{ from: "e4" as Square, to: "d5" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "great_move",
  },
  {
    id: "pawn-promote-1",
    category: "pawn",
    difficulty: 3,
    narrationKey: "puzzle_pawn_promote",
    boardSetup: board(["a7", w("pawn")]),
    correctMoves: [{ from: "a7" as Square, to: "a8" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "well_done",
  },
  {
    id: "pawn-promote-capture",
    category: "pawn",
    difficulty: 3,
    narrationKey: "puzzle_pawn_promote_capture",
    boardSetup: board(["c7", w("pawn")], ["d8", b("rook")]),
    correctMoves: [{ from: "c7" as Square, to: "d8" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "well_done",
  },
];

// ─── KNIGHT PUZZLES ──────────────────────────────────────────────────────────

const knightPuzzles: PuzzleDefinition[] = [
  {
    id: "knight-move-1",
    category: "knight",
    difficulty: 1,
    narrationKey: "puzzle_knight_move",
    boardSetup: board(["d4", w("knight")]),
    correctMoves: [
      { from: "d4" as Square, to: "e6" as Square },
      { from: "d4" as Square, to: "f5" as Square },
      { from: "d4" as Square, to: "f3" as Square },
      { from: "d4" as Square, to: "e2" as Square },
      { from: "d4" as Square, to: "c2" as Square },
      { from: "d4" as Square, to: "b3" as Square },
      { from: "d4" as Square, to: "b5" as Square },
      { from: "d4" as Square, to: "c6" as Square },
    ],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "great_move",
  },
  {
    id: "knight-capture-1",
    category: "knight",
    difficulty: 2,
    narrationKey: "puzzle_knight_capture",
    boardSetup: board(["c3", w("knight")], ["d5", b("pawn")]),
    correctMoves: [{ from: "c3" as Square, to: "d5" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "great_move",
  },
  {
    id: "knight-capture-2",
    category: "knight",
    difficulty: 2,
    narrationKey: "puzzle_knight_capture",
    // Pawn on h5 is a visual distractor but NOT capturable by knight from e4
    boardSetup: board(
      ["e4", w("knight")],
      ["f6", b("bishop")],
      ["h5", b("pawn")]
    ),
    correctMoves: [{ from: "e4" as Square, to: "f6" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "great_move",
  },
  {
    id: "knight-fork-1",
    category: "knight",
    difficulty: 3,
    narrationKey: "puzzle_knight_fork",
    // Knight can fork king and rook by going to c7
    // From c7, knight attacks: a6, a8, b5, d5, e6, e8
    boardSetup: board(
      ["d5", w("knight")],
      ["e8", b("king")],
      ["a8", b("rook")]
    ),
    correctMoves: [{ from: "d5" as Square, to: "c7" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "well_done",
  },
  {
    id: "knight-fork-2",
    category: "knight",
    difficulty: 3,
    narrationKey: "puzzle_knight_fork",
    // Knight on e5 forks king on h8 and queen on d8 by going to f7
    // From f7, knight attacks: d6, d8, e5, g5, h6, h8
    boardSetup: board(
      ["e5", w("knight")],
      ["h8", b("king")],
      ["d8", b("queen")]
    ),
    correctMoves: [{ from: "e5" as Square, to: "f7" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "well_done",
  },
];

// ─── BISHOP PUZZLES ──────────────────────────────────────────────────────────

const bishopPuzzles: PuzzleDefinition[] = [
  {
    id: "bishop-move-1",
    category: "bishop",
    difficulty: 1,
    narrationKey: "puzzle_bishop_move",
    boardSetup: board(["c1", w("bishop")]),
    correctMoves: [
      { from: "c1" as Square, to: "d2" as Square },
      { from: "c1" as Square, to: "e3" as Square },
      { from: "c1" as Square, to: "f4" as Square },
      { from: "c1" as Square, to: "g5" as Square },
      { from: "c1" as Square, to: "h6" as Square },
      { from: "c1" as Square, to: "b2" as Square },
      { from: "c1" as Square, to: "a3" as Square },
    ],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "great_move",
  },
  {
    id: "bishop-move-2",
    category: "bishop",
    difficulty: 1,
    narrationKey: "puzzle_bishop_move",
    boardSetup: board(["f4", w("bishop")]),
    correctMoves: [
      { from: "f4" as Square, to: "e3" as Square },
      { from: "f4" as Square, to: "d2" as Square },
      { from: "f4" as Square, to: "c1" as Square },
      { from: "f4" as Square, to: "g5" as Square },
      { from: "f4" as Square, to: "h6" as Square },
      { from: "f4" as Square, to: "e5" as Square },
      { from: "f4" as Square, to: "d6" as Square },
      { from: "f4" as Square, to: "c7" as Square },
      { from: "f4" as Square, to: "b8" as Square },
      { from: "f4" as Square, to: "g3" as Square },
      { from: "f4" as Square, to: "h2" as Square },
    ],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "great_move",
  },
  {
    id: "bishop-capture-1",
    category: "bishop",
    difficulty: 2,
    narrationKey: "puzzle_bishop_capture",
    boardSetup: board(["c1", w("bishop")], ["f4", b("pawn")]),
    correctMoves: [{ from: "c1" as Square, to: "f4" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "great_move",
  },
  {
    id: "bishop-capture-2",
    category: "bishop",
    difficulty: 2,
    narrationKey: "puzzle_bishop_capture",
    // Pawn on b3 is a visual distractor but NOT on bishop's diagonal from d3
    boardSetup: board(
      ["d3", w("bishop")],
      ["f5", b("knight")],
      ["b3", b("pawn")]
    ),
    correctMoves: [{ from: "d3" as Square, to: "f5" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "great_move",
  },
];

// ─── ROOK PUZZLES ────────────────────────────────────────────────────────────

const rookPuzzles: PuzzleDefinition[] = [
  {
    id: "rook-move-1",
    category: "rook",
    difficulty: 1,
    narrationKey: "puzzle_rook_move",
    boardSetup: board(["a1", w("rook")]),
    correctMoves: [
      { from: "a1" as Square, to: "a2" as Square },
      { from: "a1" as Square, to: "a3" as Square },
      { from: "a1" as Square, to: "a4" as Square },
      { from: "a1" as Square, to: "a5" as Square },
      { from: "a1" as Square, to: "a6" as Square },
      { from: "a1" as Square, to: "a7" as Square },
      { from: "a1" as Square, to: "a8" as Square },
      { from: "a1" as Square, to: "b1" as Square },
      { from: "a1" as Square, to: "c1" as Square },
      { from: "a1" as Square, to: "d1" as Square },
      { from: "a1" as Square, to: "e1" as Square },
      { from: "a1" as Square, to: "f1" as Square },
      { from: "a1" as Square, to: "g1" as Square },
      { from: "a1" as Square, to: "h1" as Square },
    ],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "great_move",
  },
  {
    id: "rook-move-2",
    category: "rook",
    difficulty: 1,
    narrationKey: "puzzle_rook_move",
    boardSetup: board(["d4", w("rook")]),
    correctMoves: [
      { from: "d4" as Square, to: "d1" as Square },
      { from: "d4" as Square, to: "d2" as Square },
      { from: "d4" as Square, to: "d3" as Square },
      { from: "d4" as Square, to: "d5" as Square },
      { from: "d4" as Square, to: "d6" as Square },
      { from: "d4" as Square, to: "d7" as Square },
      { from: "d4" as Square, to: "d8" as Square },
      { from: "d4" as Square, to: "a4" as Square },
      { from: "d4" as Square, to: "b4" as Square },
      { from: "d4" as Square, to: "c4" as Square },
      { from: "d4" as Square, to: "e4" as Square },
      { from: "d4" as Square, to: "f4" as Square },
      { from: "d4" as Square, to: "g4" as Square },
      { from: "d4" as Square, to: "h4" as Square },
    ],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "great_move",
  },
  {
    id: "rook-capture-1",
    category: "rook",
    difficulty: 2,
    narrationKey: "puzzle_rook_capture",
    boardSetup: board(["a1", w("rook")], ["a7", b("pawn")]),
    correctMoves: [{ from: "a1" as Square, to: "a7" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "great_move",
  },
  {
    id: "rook-capture-2",
    category: "rook",
    difficulty: 2,
    narrationKey: "puzzle_rook_capture",
    // Pawn on g5 is a visual distractor but NOT on rook's file or rank from d1
    boardSetup: board(
      ["d1", w("rook")],
      ["d7", b("bishop")],
      ["g5", b("pawn")]
    ),
    correctMoves: [{ from: "d1" as Square, to: "d7" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "great_move",
  },
];

// ─── QUEEN PUZZLES ───────────────────────────────────────────────────────────

const queenPuzzles: PuzzleDefinition[] = [
  {
    id: "queen-capture-1",
    category: "queen",
    difficulty: 1,
    narrationKey: "puzzle_queen_capture",
    boardSetup: board(["d1", w("queen")], ["d7", b("pawn")]),
    correctMoves: [{ from: "d1" as Square, to: "d7" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "great_move",
  },
  {
    id: "queen-capture-2",
    category: "queen",
    difficulty: 2,
    narrationKey: "puzzle_queen_capture",
    boardSetup: board(["e3", w("queen")], ["h6", b("bishop")]),
    correctMoves: [{ from: "e3" as Square, to: "h6" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "great_move",
  },
  {
    id: "queen-best-move-1",
    category: "queen",
    difficulty: 2,
    narrationKey: "puzzle_queen_best_move",
    // Queen should capture the unprotected rook (higher value) rather than a pawn
    boardSetup: board(
      ["d4", w("queen")],
      ["d7", b("rook")],
      ["b4", b("pawn")]
    ),
    correctMoves: [{ from: "d4" as Square, to: "d7" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "well_done",
  },
  {
    id: "queen-best-move-2",
    category: "queen",
    difficulty: 3,
    narrationKey: "puzzle_queen_best_move",
    // Queen should capture the knight (3pts) over pawn (1pt). Pawn on d4 is on queen's diagonal.
    boardSetup: board(
      ["a1", w("queen")],
      ["a8", b("knight")],
      ["d4", b("pawn")]
    ),
    correctMoves: [{ from: "a1" as Square, to: "a8" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "well_done",
  },
];

// ─── KING PUZZLES ────────────────────────────────────────────────────────────

const kingPuzzles: PuzzleDefinition[] = [
  {
    id: "king-move-1",
    category: "king",
    difficulty: 1,
    narrationKey: "puzzle_king_move",
    boardSetup: board(["e1", w("king")]),
    correctMoves: [
      { from: "e1" as Square, to: "d1" as Square },
      { from: "e1" as Square, to: "d2" as Square },
      { from: "e1" as Square, to: "e2" as Square },
      { from: "e1" as Square, to: "f2" as Square },
      { from: "e1" as Square, to: "f1" as Square },
    ],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "great_move",
  },
  {
    id: "king-safe-1",
    category: "king",
    difficulty: 2,
    narrationKey: "puzzle_king_safe",
    // King on e1, enemy rook on a2 controls the 2nd rank. King must go to d1 or f1 (not e2/d2/f2).
    boardSetup: board(["e1", w("king")], ["a2", b("rook")]),
    correctMoves: [
      { from: "e1" as Square, to: "d1" as Square },
      { from: "e1" as Square, to: "f1" as Square },
    ],
    wrongMoveNarrationKey: "king_danger",
    successNarrationKey: "great_move",
  },
  {
    id: "king-safe-2",
    category: "king",
    difficulty: 2,
    narrationKey: "puzzle_king_safe",
    // King on d4, enemy bishop on a1 (controls a1-h8 diagonal: b2,c3,d4,e5,f6,g7).
    // Safe king moves: d5, d3, e4, c4, e3 (not e5 or c3 - on the diagonal).
    boardSetup: board(["d4", w("king")], ["a1", b("bishop")]),
    correctMoves: [
      { from: "d4" as Square, to: "d5" as Square },
      { from: "d4" as Square, to: "d3" as Square },
      { from: "d4" as Square, to: "e4" as Square },
      { from: "d4" as Square, to: "c4" as Square },
      { from: "d4" as Square, to: "e3" as Square },
    ],
    wrongMoveNarrationKey: "king_danger",
    successNarrationKey: "great_move",
  },
  {
    id: "king-safe-3",
    category: "king",
    difficulty: 3,
    narrationKey: "puzzle_king_safe",
    // King on f3 in check from bishop on h1 (diagonal a8-h1: g2,f3,e4,d5,c6,b7,a8).
    // Rook on a4 controls the 4th rank. King must escape.
    // Unsafe: e4 (diagonal + rank), f4 (rank), g4 (rank), g2 (diagonal).
    // Safe: e2, e3, f2, g3.
    boardSetup: board(
      ["f3", w("king")],
      ["a4", b("rook")],
      ["h1", b("bishop")]
    ),
    correctMoves: [
      { from: "f3" as Square, to: "e2" as Square },
      { from: "f3" as Square, to: "e3" as Square },
      { from: "f3" as Square, to: "f2" as Square },
      { from: "f3" as Square, to: "g3" as Square },
    ],
    wrongMoveNarrationKey: "king_danger",
    successNarrationKey: "well_done",
  },
];

// ─── CHECKMATE PUZZLES ───────────────────────────────────────────────────────

const checkmatePuzzles: PuzzleDefinition[] = [
  {
    id: "mate-queen-1",
    category: "checkmate",
    difficulty: 1,
    narrationKey: "puzzle_checkmate",
    // White king f6 supports g7. Qg1-g7# is checkmate (king can't capture, all squares covered).
    boardSetup: board(
      ["f6", w("king")],
      ["g1", w("queen")],
      ["h8", b("king")]
    ),
    correctMoves: [{ from: "g1" as Square, to: "g7" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "well_done",
  },
  {
    id: "mate-rook-1",
    category: "checkmate",
    difficulty: 2,
    narrationKey: "puzzle_checkmate",
    // Black king on g8 boxed in by white king on g6. White rook on a1 mates on a8.
    boardSetup: board(
      ["g6", w("king")],
      ["a1", w("rook")],
      ["g8", b("king")]
    ),
    correctMoves: [{ from: "a1" as Square, to: "a8" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "well_done",
  },
  {
    id: "mate-rook-backrank",
    category: "checkmate",
    difficulty: 2,
    narrationKey: "puzzle_checkmate",
    // Back-rank mate: Black king on g8 with pawns on f7, g7, h7. White rook mates on 8th rank.
    boardSetup: board(
      ["e1", w("king")],
      ["d1", w("rook")],
      ["g8", b("king")],
      ["f7", b("pawn")],
      ["g7", b("pawn")],
      ["h7", b("pawn")]
    ),
    correctMoves: [{ from: "d1" as Square, to: "d8" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "well_done",
  },
  {
    id: "mate-queen-support",
    category: "checkmate",
    difficulty: 2,
    narrationKey: "puzzle_checkmate",
    // Qd5-h5#: Queen checks along h-file. King h8 blocked: g8 guarded by Kf7, g7 guarded by Kf7, h7 guarded by Qh5.
    boardSetup: board(
      ["f7", w("king")],
      ["d5", w("queen")],
      ["h8", b("king")]
    ),
    correctMoves: [{ from: "d5" as Square, to: "h5" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "well_done",
  },
  {
    id: "mate-two-rooks",
    category: "checkmate",
    difficulty: 3,
    narrationKey: "puzzle_checkmate",
    // Ladder mate: Rb3 covers b-file, Rd1→a1# mates. King a8 can't go to b8/b7 (Rb3) or a7 (Ra1).
    boardSetup: board(
      ["f3", w("king")],
      ["b3", w("rook")],
      ["d1", w("rook")],
      ["a8", b("king")]
    ),
    correctMoves: [{ from: "d1" as Square, to: "a1" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "well_done",
  },
];

// ─── TACTICS PUZZLES ─────────────────────────────────────────────────────────

const tacticsPuzzles: PuzzleDefinition[] = [
  {
    id: "tactic-fork-knight-1",
    category: "tactics",
    difficulty: 2,
    narrationKey: "puzzle_tactic_fork",
    // Knight fork: move knight to c7 to fork king on e8 and rook on a8
    boardSetup: board(
      ["e1", w("king")],
      ["b5", w("knight")],
      ["e8", b("king")],
      ["a8", b("rook")]
    ),
    correctMoves: [{ from: "b5" as Square, to: "c7" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "well_done",
  },
  {
    id: "tactic-fork-knight-2",
    category: "tactics",
    difficulty: 2,
    narrationKey: "puzzle_tactic_fork",
    // Knight fork: move knight from e5 to d7, forking king on f8 and queen on b6
    // From d7 the knight attacks: b6, b8, c5, e5, f6, f8
    boardSetup: board(
      ["e1", w("king")],
      ["e5", w("knight")],
      ["f8", b("king")],
      ["b6", b("queen")]
    ),
    correctMoves: [{ from: "e5" as Square, to: "d7" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "well_done",
  },
  {
    id: "tactic-pin-bishop-1",
    category: "tactics",
    difficulty: 2,
    narrationKey: "puzzle_tactic_pin",
    // Bishop pins the knight to the king: move bishop to b5 to pin knight on d7
    boardSetup: board(
      ["e1", w("king")],
      ["f1", w("bishop")],
      ["e8", b("king")],
      ["d7", b("knight")]
    ),
    correctMoves: [{ from: "f1" as Square, to: "b5" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "well_done",
  },
  {
    id: "tactic-pin-rook-1",
    category: "tactics",
    difficulty: 3,
    narrationKey: "puzzle_tactic_pin",
    // Rook creates a pin: move rook from a1 to a5, pinning the black knight on a5.
    // Actually: rook on h4 moves to d4, pinning black bishop on d4 to king on d8.
    // Simpler: rook on e1 pins queen on e5 to king on e8 (rook moves to e-file).
    // White rook on a1 moves to e1, creating pin on black knight e4 against black king e8.
    boardSetup: board(
      ["g1", w("king")],
      ["a1", w("rook")],
      ["e4", b("knight")],
      ["e8", b("king")]
    ),
    correctMoves: [{ from: "a1" as Square, to: "e1" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "well_done",
  },
  {
    id: "tactic-fork-queen-1",
    category: "tactics",
    difficulty: 3,
    narrationKey: "puzzle_tactic_fork",
    // Queen fork: Qc2→e4 checks king on e8 (e-file) and attacks rook a8 (diagonal e4-d5-c6-b7-a8).
    // Rook on a8 cannot capture queen on e4 (no shared file/rank/diagonal).
    boardSetup: board(
      ["g1", w("king")],
      ["c2", w("queen")],
      ["e8", b("king")],
      ["a8", b("rook")]
    ),
    correctMoves: [{ from: "c2" as Square, to: "e4" as Square }],
    wrongMoveNarrationKey: "try_again",
    successNarrationKey: "well_done",
  },
];

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export const PUZZLES: PuzzleDefinition[] = [
  ...pawnPuzzles,
  ...knightPuzzles,
  ...bishopPuzzles,
  ...rookPuzzles,
  ...queenPuzzles,
  ...kingPuzzles,
  ...checkmatePuzzles,
  ...tacticsPuzzles,
];

export type PuzzleCategory = PuzzleDefinition["category"];

export function getPuzzlesByCategory(
  category: PuzzleCategory
): PuzzleDefinition[] {
  return PUZZLES.filter((p) => p.category === category);
}
