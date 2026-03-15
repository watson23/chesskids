import type { Lesson } from "@/types/lesson";
import type { Square, ChessPiece } from "@/types/chess";

/** Helper to build a piece record more concisely */
function pos(
  ...entries: [Square, ChessPiece["type"], ChessPiece["color"]][]
): Record<Square, ChessPiece> {
  const result: Record<string, ChessPiece> = {};
  for (const [sq, type, color] of entries) {
    result[sq] = { type, color };
  }
  return result as Record<Square, ChessPiece>;
}

// ---------- 1. Board Intro ----------
const boardIntro: Lesson = {
  id: "board-intro",
  icon: "board",
  steps: [
    {
      narrationKey: "board_intro",
      boardSetup: {} as Record<Square, ChessPiece>,
    },
    {
      narrationKey: "board_intro_squares",
      boardSetup: {} as Record<Square, ChessPiece>,
      animation: {
        piece: "e4" as Square,
        path: ["e4"] as Square[],
        highlights: ["a1", "c1", "e1", "g1", "b2", "d2", "f2", "h2"] as Square[],
      },
    },
  ],
  puzzles: [
    {
      narrationKey: "board_intro_puzzle_light",
      boardSetup: pos(["d4", "king", "white"]),
      correctMoves: [
        { from: "d4" as Square, to: "c4" as Square },
        { from: "d4" as Square, to: "d3" as Square },
        { from: "d4" as Square, to: "d5" as Square },
        { from: "d4" as Square, to: "e4" as Square },
      ],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "board_intro_puzzle_dark",
      boardSetup: pos(["e5", "king", "white"]),
      correctMoves: [
        { from: "e5" as Square, to: "d4" as Square },
        { from: "e5" as Square, to: "d6" as Square },
        { from: "e5" as Square, to: "f4" as Square },
        { from: "e5" as Square, to: "f6" as Square },
      ],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- 2. How Chess Works (NEW) ----------
const howChessWorksLesson: Lesson = {
  id: "how-chess-works",
  icon: "special",
  steps: [
    {
      narrationKey: "how_chess_intro",
      // Show a few white and black pieces facing each other
      boardSetup: pos(
        ["e1", "king", "white"],
        ["d1", "queen", "white"],
        ["e2", "pawn", "white"],
        ["d2", "pawn", "white"],
        ["e8", "king", "black"],
        ["d8", "queen", "black"],
        ["e7", "pawn", "black"],
        ["d7", "pawn", "black"]
      ),
    },
    {
      narrationKey: "how_chess_turns",
      // Simple position — white pawn moves forward
      boardSetup: pos(
        ["e2", "pawn", "white"],
        ["e7", "pawn", "black"]
      ),
      animation: {
        piece: "e2" as Square,
        path: ["e4"] as Square[],
        highlights: ["e4"] as Square[],
      },
    },
    {
      narrationKey: "how_chess_capture",
      // White rook captures black pawn
      boardSetup: pos(
        ["d1", "rook", "white"],
        ["d5", "pawn", "black"]
      ),
      animation: {
        piece: "d1" as Square,
        path: ["d5"] as Square[],
        highlights: ["d5"] as Square[],
      },
    },
    {
      narrationKey: "how_chess_goal",
      // Show a checkmate position — king trapped
      boardSetup: pos(
        ["h8", "king", "black"],
        ["a8", "rook", "white"],
        ["g6", "king", "white"]
      ),
    },
  ],
  puzzles: [
    {
      narrationKey: "how_chess_puzzle_capture",
      // Rook on d1, black pawn on d5 — capture along d-file
      boardSetup: pos(
        ["d1", "rook", "white"],
        ["d5", "pawn", "black"]
      ),
      correctMoves: [{ from: "d1" as Square, to: "d5" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "how_chess_puzzle_capture_2",
      // Bishop on c1, black knight on f4
      // Diagonal c1→d2→e3→f4 — valid bishop move
      boardSetup: pos(
        ["c1", "bishop", "white"],
        ["f4", "knight", "black"]
      ),
      correctMoves: [{ from: "c1" as Square, to: "f4" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- 3. Pawn ----------
const pawnLesson: Lesson = {
  id: "pawn",
  icon: "pawn",
  pieceFocus: "pawn",
  steps: [
    {
      narrationKey: "pawn_intro",
      boardSetup: pos(["e4", "pawn", "white"]),
    },
    {
      narrationKey: "pawn_moves",
      boardSetup: pos(["e2", "pawn", "white"]),
      animation: {
        piece: "e2" as Square,
        path: ["e3"] as Square[],
        highlights: ["e3"] as Square[],
      },
    },
    {
      narrationKey: "pawn_first_move",
      boardSetup: pos(["e2", "pawn", "white"]),
      animation: {
        piece: "e2" as Square,
        path: ["e4"] as Square[],
        highlights: ["e3", "e4"] as Square[],
      },
    },
    {
      narrationKey: "pawn_captures",
      boardSetup: pos(
        ["e4", "pawn", "white"],
        ["d5", "pawn", "black"],
        ["f5", "pawn", "black"]
      ),
      animation: {
        piece: "e4" as Square,
        path: ["d5"] as Square[],
        highlights: ["d5", "f5"] as Square[],
      },
    },
  ],
  puzzles: [
    {
      narrationKey: "pawn_puzzle_move",
      boardSetup: pos(["d2", "pawn", "white"]),
      correctMoves: [
        { from: "d2" as Square, to: "d3" as Square },
        { from: "d2" as Square, to: "d4" as Square },
      ],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "pawn_puzzle_capture",
      boardSetup: pos(
        ["e4", "pawn", "white"],
        ["d5", "pawn", "black"]
      ),
      correctMoves: [{ from: "e4" as Square, to: "d5" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- 4. Knight ----------
const knightLesson: Lesson = {
  id: "knight",
  icon: "knight",
  pieceFocus: "knight",
  steps: [
    {
      narrationKey: "knight_intro",
      boardSetup: pos(["d4", "knight", "white"]),
    },
    {
      narrationKey: "knight_moves",
      boardSetup: pos(["e4", "knight", "white"]),
      animation: {
        piece: "e4" as Square,
        path: ["f6"] as Square[],
        highlights: [
          "d6", "f6", "c5", "g5", "c3", "g3", "d2", "f2",
        ] as Square[],
      },
    },
    {
      narrationKey: "knight_jumps",
      boardSetup: pos(
        ["e4", "knight", "white"],
        ["d4", "pawn", "white"],
        ["e5", "pawn", "white"],
        ["f4", "pawn", "white"],
        ["e3", "pawn", "white"]
      ),
      animation: {
        piece: "e4" as Square,
        path: ["d6"] as Square[],
        highlights: [
          "d6", "f6", "c5", "g5", "c3", "g3", "d2", "f2",
        ] as Square[],
      },
    },
  ],
  puzzles: [
    {
      narrationKey: "knight_puzzle_move",
      boardSetup: pos(["b1", "knight", "white"]),
      correctMoves: [
        { from: "b1" as Square, to: "c3" as Square },
        { from: "b1" as Square, to: "a3" as Square },
      ],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "knight_puzzle_capture",
      boardSetup: pos(
        ["e4", "knight", "white"],
        ["f6", "pawn", "black"]
      ),
      correctMoves: [{ from: "e4" as Square, to: "f6" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- 5. Bishop ----------
const bishopLesson: Lesson = {
  id: "bishop",
  icon: "bishop",
  pieceFocus: "bishop",
  steps: [
    {
      narrationKey: "bishop_intro",
      boardSetup: pos(["d4", "bishop", "white"]),
    },
    {
      narrationKey: "bishop_moves",
      boardSetup: pos(["c1", "bishop", "white"]),
      animation: {
        piece: "c1" as Square,
        path: ["f4"] as Square[],
        highlights: ["d2", "e3", "f4", "g5", "h6", "b2", "a3"] as Square[],
      },
    },
    {
      narrationKey: "bishop_same_color",
      boardSetup: pos(["f1", "bishop", "white"]),
      animation: {
        piece: "f1" as Square,
        path: ["c4"] as Square[],
        highlights: ["e2", "d3", "c4", "b5", "a6", "g2", "h3"] as Square[],
      },
    },
  ],
  puzzles: [
    {
      narrationKey: "bishop_puzzle_move",
      boardSetup: pos(["c1", "bishop", "white"]),
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
      narrationKey: "bishop_puzzle_capture",
      boardSetup: pos(
        ["c1", "bishop", "white"],
        ["f4", "pawn", "black"]
      ),
      correctMoves: [{ from: "c1" as Square, to: "f4" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- 6. Rook ----------
const rookLesson: Lesson = {
  id: "rook",
  icon: "rook",
  pieceFocus: "rook",
  steps: [
    {
      narrationKey: "rook_intro",
      boardSetup: pos(["d4", "rook", "white"]),
    },
    {
      narrationKey: "rook_moves",
      boardSetup: pos(["a1", "rook", "white"]),
      animation: {
        piece: "a1" as Square,
        path: ["a8"] as Square[],
        highlights: [
          "a2", "a3", "a4", "a5", "a6", "a7", "a8",
          "b1", "c1", "d1", "e1", "f1", "g1", "h1",
        ] as Square[],
      },
    },
    {
      narrationKey: "rook_moves_horizontal",
      boardSetup: pos(["d4", "rook", "white"]),
      animation: {
        piece: "d4" as Square,
        path: ["h4"] as Square[],
        highlights: [
          "d1", "d2", "d3", "d5", "d6", "d7", "d8",
          "a4", "b4", "c4", "e4", "f4", "g4", "h4",
        ] as Square[],
      },
    },
  ],
  puzzles: [
    {
      narrationKey: "rook_puzzle_move",
      boardSetup: pos(["a1", "rook", "white"]),
      correctMoves: [
        { from: "a1" as Square, to: "a8" as Square },
        { from: "a1" as Square, to: "h1" as Square },
        { from: "a1" as Square, to: "a4" as Square },
        { from: "a1" as Square, to: "d1" as Square },
        { from: "a1" as Square, to: "a2" as Square },
        { from: "a1" as Square, to: "a3" as Square },
        { from: "a1" as Square, to: "a5" as Square },
        { from: "a1" as Square, to: "a6" as Square },
        { from: "a1" as Square, to: "a7" as Square },
        { from: "a1" as Square, to: "b1" as Square },
        { from: "a1" as Square, to: "c1" as Square },
        { from: "a1" as Square, to: "e1" as Square },
        { from: "a1" as Square, to: "f1" as Square },
        { from: "a1" as Square, to: "g1" as Square },
      ],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "rook_puzzle_capture",
      boardSetup: pos(
        ["a1", "rook", "white"],
        ["a7", "pawn", "black"]
      ),
      correctMoves: [{ from: "a1" as Square, to: "a7" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- 7. Queen ----------
const queenLesson: Lesson = {
  id: "queen",
  icon: "queen",
  pieceFocus: "queen",
  steps: [
    {
      narrationKey: "queen_intro",
      boardSetup: pos(["d4", "queen", "white"]),
    },
    {
      narrationKey: "queen_moves",
      boardSetup: pos(["d1", "queen", "white"]),
      animation: {
        piece: "d1" as Square,
        path: ["d8"] as Square[],
        highlights: [
          "d2", "d3", "d4", "d5", "d6", "d7", "d8",
          "a1", "b1", "c1", "e1", "f1", "g1", "h1",
          "e2", "f3", "g4", "h5",
          "c2", "b3", "a4",
        ] as Square[],
      },
    },
    {
      narrationKey: "queen_power",
      boardSetup: pos(["d4", "queen", "white"]),
      animation: {
        piece: "d4" as Square,
        path: ["h8"] as Square[],
        highlights: [
          "d1", "d2", "d3", "d5", "d6", "d7", "d8",
          "a4", "b4", "c4", "e4", "f4", "g4", "h4",
          "e5", "f6", "g7", "h8",
          "c5", "b6", "a7",
          "e3", "f2", "g1",
          "c3", "b2", "a1",
        ] as Square[],
      },
    },
  ],
  puzzles: [
    {
      narrationKey: "queen_puzzle_move",
      boardSetup: pos(["d1", "queen", "white"]),
      correctMoves: [
        { from: "d1" as Square, to: "d8" as Square },
        { from: "d1" as Square, to: "h5" as Square },
        { from: "d1" as Square, to: "a4" as Square },
        { from: "d1" as Square, to: "d4" as Square },
        { from: "d1" as Square, to: "h1" as Square },
        { from: "d1" as Square, to: "a1" as Square },
      ],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "queen_puzzle_capture",
      boardSetup: pos(
        ["d1", "queen", "white"],
        ["d7", "pawn", "black"]
      ),
      correctMoves: [{ from: "d1" as Square, to: "d7" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- 8. King ----------
const kingLesson: Lesson = {
  id: "king",
  icon: "king",
  pieceFocus: "king",
  steps: [
    {
      narrationKey: "king_intro",
      boardSetup: pos(["e4", "king", "white"]),
    },
    {
      narrationKey: "king_moves",
      boardSetup: pos(["e4", "king", "white"]),
      animation: {
        piece: "e4" as Square,
        path: ["e5"] as Square[],
        highlights: [
          "d5", "e5", "f5", "d4", "f4", "d3", "e3", "f3",
        ] as Square[],
      },
    },
    {
      narrationKey: "king_safety",
      boardSetup: pos(
        ["e1", "king", "white"],
        ["e3", "rook", "black"]
      ),
      animation: {
        piece: "e1" as Square,
        path: ["d1"] as Square[],
        highlights: ["d1", "d2", "f1", "f2"] as Square[],
      },
    },
  ],
  puzzles: [
    {
      narrationKey: "king_puzzle_move",
      boardSetup: pos(["e4", "king", "white"]),
      correctMoves: [
        { from: "e4" as Square, to: "d5" as Square },
        { from: "e4" as Square, to: "e5" as Square },
        { from: "e4" as Square, to: "f5" as Square },
        { from: "e4" as Square, to: "d4" as Square },
        { from: "e4" as Square, to: "f4" as Square },
        { from: "e4" as Square, to: "d3" as Square },
        { from: "e4" as Square, to: "e3" as Square },
        { from: "e4" as Square, to: "f3" as Square },
      ],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "king_puzzle_safe",
      boardSetup: pos(
        ["e1", "king", "white"],
        ["e3", "rook", "black"]
      ),
      correctMoves: [
        { from: "e1" as Square, to: "d1" as Square },
        { from: "e1" as Square, to: "f1" as Square },
        { from: "e1" as Square, to: "d2" as Square },
        { from: "e1" as Square, to: "f2" as Square },
      ],
      wrongMoveNarrationKey: "king_danger",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- 9. Check ----------
const checkLesson: Lesson = {
  id: "check",
  icon: "king",
  steps: [
    {
      narrationKey: "check_intro",
      // Rook on e1 gives check to king on e8
      boardSetup: pos(
        ["e8", "king", "black"],
        ["e1", "rook", "white"],
        ["a1", "king", "white"]
      ),
      animation: {
        piece: "e1" as Square,
        path: ["e8"] as Square[],
        highlights: ["e8"] as Square[],
      },
    },
    {
      narrationKey: "check_escape_move",
      // King escapes check by moving away
      boardSetup: pos(
        ["e8", "king", "black"],
        ["e1", "rook", "white"],
        ["a1", "king", "white"]
      ),
      animation: {
        piece: "e8" as Square,
        path: ["d8"] as Square[],
        highlights: ["d8", "f8", "d7", "f7"] as Square[],
      },
    },
    {
      narrationKey: "check_escape_block",
      // Block the check with a bishop
      // Bishop on c5 can move to e7 to block rook e1→e8 line
      // Diagonal c5→d6→e7 — yes, c5 to e7 is a valid bishop move
      boardSetup: pos(
        ["e8", "king", "black"],
        ["e1", "rook", "white"],
        ["a1", "king", "white"],
        ["c5", "bishop", "black"]
      ),
      animation: {
        piece: "c5" as Square,
        path: ["e7"] as Square[],
        highlights: ["e7"] as Square[],
      },
    },
  ],
  puzzles: [
    {
      narrationKey: "check_puzzle_give",
      // Give check: rook from a1 to e1 (attacks king on e8 along e-file)
      boardSetup: pos(
        ["e8", "king", "black"],
        ["a1", "rook", "white"],
        ["h1", "king", "white"]
      ),
      correctMoves: [{ from: "a1" as Square, to: "e1" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "check_puzzle_give_2",
      // Give check: bishop from a2 to e6 (attacks king on f7)
      // Diagonal: a2-b3-c4-d5-e6, and e6 attacks f7
      boardSetup: pos(
        ["f7", "king", "black"],
        ["a2", "bishop", "white"],
        ["a1", "king", "white"]
      ),
      correctMoves: [{ from: "a2" as Square, to: "e6" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- 10. Checkmate ----------
const checkmateLesson: Lesson = {
  id: "checkmate",
  icon: "king",
  steps: [
    {
      narrationKey: "checkmate_intro",
      // Two rooks + king trap black king — classic ladder mate position
      boardSetup: pos(
        ["h8", "king", "black"],
        ["a8", "rook", "white"],
        ["g6", "king", "white"],
        ["b7", "rook", "white"]
      ),
    },
    {
      narrationKey: "checkmate_example",
      // Queen delivers back-rank mate against pawns
      boardSetup: pos(
        ["g8", "king", "black"],
        ["f7", "pawn", "black"],
        ["g7", "pawn", "black"],
        ["h7", "pawn", "black"],
        ["d1", "queen", "white"],
        ["e1", "king", "white"]
      ),
      animation: {
        piece: "d1" as Square,
        path: ["d8"] as Square[],
        highlights: ["d8"] as Square[],
      },
    },
    {
      narrationKey: "checkmate_vs_check",
      // Show a checkmate position — king has no escape
      boardSetup: pos(
        ["h8", "king", "black"],
        ["a8", "rook", "white"],
        ["g6", "king", "white"]
      ),
    },
  ],
  puzzles: [
    {
      narrationKey: "checkmate_puzzle",
      // Back rank mate: rook to a8
      // White king on g6 covers g7/g8/h7, rook on a8 checks h8
      boardSetup: pos(
        ["h8", "king", "black"],
        ["a1", "rook", "white"],
        ["g6", "king", "white"]
      ),
      correctMoves: [{ from: "a1" as Square, to: "a8" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "checkmate_puzzle_2",
      // Queen captures g7 pawn = checkmate
      // King on h8 blocked by own h7 pawn, queen on g7 covers g8
      boardSetup: pos(
        ["h8", "king", "black"],
        ["g7", "pawn", "black"],
        ["h7", "pawn", "black"],
        ["g5", "queen", "white"],
        ["e1", "king", "white"]
      ),
      correctMoves: [{ from: "g5" as Square, to: "g7" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- 11. Piece Values (NEW) ----------
const pieceValuesLesson: Lesson = {
  id: "piece-values",
  icon: "tactics",
  steps: [
    {
      narrationKey: "piece_values_intro",
      // Show all piece types — queen most prominent
      boardSetup: pos(
        ["a1", "pawn", "white"],
        ["c1", "knight", "white"],
        ["e1", "bishop", "white"],
        ["g1", "rook", "white"],
        ["d4", "queen", "white"]
      ),
    },
    {
      narrationKey: "piece_values_order",
      // Line them up in order of value
      boardSetup: pos(
        ["a2", "pawn", "white"],
        ["b2", "knight", "white"],
        ["c2", "bishop", "white"],
        ["e2", "rook", "white"],
        ["g2", "queen", "white"]
      ),
    },
    {
      narrationKey: "piece_values_best_capture",
      // Queen can capture rook or pawn — show why rook is better
      boardSetup: pos(
        ["d1", "queen", "white"],
        ["d7", "rook", "black"],
        ["b3", "pawn", "black"]
      ),
      animation: {
        piece: "d1" as Square,
        path: ["d7"] as Square[],
        highlights: ["d7"] as Square[],
      },
    },
  ],
  puzzles: [
    {
      narrationKey: "piece_values_puzzle",
      // Queen on d1, black rook on d7, black pawn on b3
      // d1→d7 (straight line) captures rook (5pts)
      // d1→b3 (diagonal d1→c2→b3) captures pawn (1pt)
      // Best: take the rook
      boardSetup: pos(
        ["d1", "queen", "white"],
        ["d7", "rook", "black"],
        ["b3", "pawn", "black"]
      ),
      correctMoves: [{ from: "d1" as Square, to: "d7" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "piece_values_puzzle_2",
      // Rook on a1, black queen on a7, black bishop on e1
      // a1→a7 (file) captures queen (9pts)
      // a1→e1 (rank) captures bishop (3pts)
      // Best: take the queen
      boardSetup: pos(
        ["a1", "rook", "white"],
        ["a7", "queen", "black"],
        ["e1", "bishop", "black"]
      ),
      correctMoves: [{ from: "a1" as Square, to: "a7" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- 12. Protecting ----------
const protectingLesson: Lesson = {
  id: "protecting",
  icon: "special",
  steps: [
    {
      narrationKey: "protecting_intro",
      // Pawn c3 guards pawn d4 (c3 captures diagonally to d4)
      boardSetup: pos(
        ["d4", "pawn", "white"],
        ["c3", "pawn", "white"]
      ),
      animation: {
        piece: "c3" as Square,
        path: [] as Square[],
        highlights: ["c3", "d4"] as Square[],
      },
    },
    {
      narrationKey: "protecting_why",
      // Black bishop threatens d4 via a7-b6-c5-d4 diagonal, but c3 guards it
      boardSetup: pos(
        ["d4", "pawn", "white"],
        ["c3", "pawn", "white"],
        ["a7", "bishop", "black"]
      ),
      animation: {
        piece: "a7" as Square,
        path: [] as Square[],
        highlights: ["d4", "c3"] as Square[],
      },
    },
    {
      narrationKey: "protecting_safe_attack",
      // Knight on e4 protected by pawn on d3 (d3 captures diagonally to e4)
      boardSetup: pos(
        ["e4", "knight", "white"],
        ["d3", "pawn", "white"],
        ["f6", "knight", "black"]
      ),
      animation: {
        piece: "d3" as Square,
        path: [] as Square[],
        highlights: ["d3", "e4"] as Square[],
      },
    },
  ],
  puzzles: [
    {
      narrationKey: "protecting_puzzle",
      // Move f2 pawn to f3 to protect e4 pawn
      // f3 pawn captures diagonally to e4 and g4
      // Bishop on d6 threatens e4 via d6... wait, does it? d6 diagonals: c7/b8, e7/f8, c5/b4/a3, e5/f4/g3/h2
      // d6 does NOT attack e4. Let me use a better threat.
      // Use knight on f6: f6 attacks e4 (knight move f6→e4: -1,-2 from f6 = e4. Yes!)
      boardSetup: pos(
        ["e4", "pawn", "white"],
        ["f2", "pawn", "white"],
        ["f6", "knight", "black"]
      ),
      correctMoves: [{ from: "f2" as Square, to: "f3" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "protecting_puzzle_2",
      // Move e3 pawn to e4 to protect d5 pawn
      // e4 pawn captures diagonally to d5 and f5
      // Black knight on c7 threatens d5 (c7→d5: +1,-2 = d5. Yes!)
      boardSetup: pos(
        ["d5", "pawn", "white"],
        ["e3", "pawn", "white"],
        ["c7", "knight", "black"]
      ),
      correctMoves: [{ from: "e3" as Square, to: "e4" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- 13. Castling ----------
const castlingLesson: Lesson = {
  id: "castling",
  icon: "special",
  steps: [
    {
      narrationKey: "castling_intro",
      boardSetup: pos(
        ["e1", "king", "white"],
        ["h1", "rook", "white"]
      ),
      animation: {
        piece: "e1" as Square,
        path: ["g1"] as Square[],
        highlights: ["g1", "f1"] as Square[],
      },
    },
    {
      narrationKey: "castling_queenside",
      boardSetup: pos(
        ["e1", "king", "white"],
        ["a1", "rook", "white"]
      ),
      animation: {
        piece: "e1" as Square,
        path: ["c1"] as Square[],
        highlights: ["c1", "d1"] as Square[],
      },
    },
    {
      narrationKey: "castling_conditions",
      boardSetup: pos(
        ["e1", "king", "white"],
        ["h1", "rook", "white"],
        ["a1", "rook", "white"]
      ),
    },
  ],
  puzzles: [
    {
      narrationKey: "castling_puzzle_kingside",
      boardSetup: pos(
        ["e1", "king", "white"],
        ["h1", "rook", "white"]
      ),
      correctMoves: [{ from: "e1" as Square, to: "g1" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "castling_puzzle_queenside",
      boardSetup: pos(
        ["e1", "king", "white"],
        ["a1", "rook", "white"]
      ),
      correctMoves: [{ from: "e1" as Square, to: "c1" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- 14. Promotion ----------
const promotionLesson: Lesson = {
  id: "promotion",
  icon: "special",
  steps: [
    {
      narrationKey: "promotion_intro",
      boardSetup: pos(["e7", "pawn", "white"]),
      animation: {
        piece: "e7" as Square,
        path: ["e8"] as Square[],
        highlights: ["e8"] as Square[],
      },
    },
    {
      narrationKey: "promotion_queen",
      boardSetup: pos(["e8", "queen", "white"]),
    },
  ],
  puzzles: [
    {
      narrationKey: "promotion_puzzle",
      boardSetup: pos(["d7", "pawn", "white"]),
      correctMoves: [{ from: "d7" as Square, to: "d8" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "promotion_puzzle_capture",
      boardSetup: pos(
        ["d7", "pawn", "white"],
        ["c8", "bishop", "black"]
      ),
      correctMoves: [
        { from: "d7" as Square, to: "d8" as Square },
        { from: "d7" as Square, to: "c8" as Square },
      ],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- 15. Putting It Together ----------
const capstoneLesson: Lesson = {
  id: "capstone",
  icon: "tactics",
  steps: [
    {
      narrationKey: "capstone_intro",
      // Show all the pieces the kid has learned
      boardSetup: pos(
        ["e1", "king", "white"],
        ["d1", "queen", "white"],
        ["a1", "rook", "white"],
        ["h1", "rook", "white"],
        ["c1", "bishop", "white"],
        ["f1", "bishop", "white"],
        ["b1", "knight", "white"],
        ["g1", "knight", "white"]
      ),
    },
    {
      narrationKey: "capstone_tips",
      // A mid-game position showing pieces working together
      boardSetup: pos(
        ["e1", "king", "white"],
        ["d4", "pawn", "white"],
        ["e4", "pawn", "white"],
        ["c3", "knight", "white"],
        ["e8", "king", "black"],
        ["d5", "pawn", "black"]
      ),
    },
  ],
  puzzles: [
    {
      narrationKey: "capstone_puzzle_capture",
      // Capture the rook (most valuable) with queen along d-file
      boardSetup: pos(
        ["d1", "queen", "white"],
        ["d7", "rook", "black"],
        ["b4", "knight", "black"],
        ["e1", "king", "white"],
        ["e8", "king", "black"]
      ),
      correctMoves: [{ from: "d1" as Square, to: "d7" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "capstone_puzzle_checkmate",
      // Back rank mate: rook to a8
      // White king on g6 covers g7/g8/h7
      boardSetup: pos(
        ["h8", "king", "black"],
        ["a1", "rook", "white"],
        ["g6", "king", "white"]
      ),
      correctMoves: [{ from: "a1" as Square, to: "a8" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- Export ----------
export const LESSONS: Lesson[] = [
  boardIntro,          //  1 — Board Intro
  howChessWorksLesson, //  2 — How Chess Works
  pawnLesson,          //  3 — Pawn
  knightLesson,        //  4 — Knight
  bishopLesson,        //  5 — Bishop
  rookLesson,          //  6 — Rook
  queenLesson,         //  7 — Queen
  kingLesson,          //  8 — King
  checkLesson,         //  9 — Check
  checkmateLesson,     // 10 — Checkmate
  pieceValuesLesson,   // 11 — Piece Values
  protectingLesson,    // 12 — Protecting
  castlingLesson,      // 13 — Castling
  promotionLesson,     // 14 — Promotion
  capstoneLesson,      // 15 — Putting It Together
];

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
