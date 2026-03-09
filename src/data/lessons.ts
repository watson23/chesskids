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
      boardSetup: {} as Record<Square, ChessPiece>,
      correctMoves: [{ from: "e4" as Square, to: "e4" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "board_intro_puzzle_dark",
      boardSetup: {} as Record<Square, ChessPiece>,
      correctMoves: [{ from: "d4" as Square, to: "d4" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- 2. Pawn ----------
const pawnLesson: Lesson = {
  id: "pawn",
  icon: "pawn",
  pieceFocus: "pawn",
  steps: [
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

// ---------- 3. Knight ----------
const knightLesson: Lesson = {
  id: "knight",
  icon: "knight",
  pieceFocus: "knight",
  steps: [
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

// ---------- 4. Bishop ----------
const bishopLesson: Lesson = {
  id: "bishop",
  icon: "bishop",
  pieceFocus: "bishop",
  steps: [
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

// ---------- 5. Rook ----------
const rookLesson: Lesson = {
  id: "rook",
  icon: "rook",
  pieceFocus: "rook",
  steps: [
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

// ---------- 6. Queen ----------
const queenLesson: Lesson = {
  id: "queen",
  icon: "queen",
  pieceFocus: "queen",
  steps: [
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

// ---------- 7. King ----------
const kingLesson: Lesson = {
  id: "king",
  icon: "king",
  pieceFocus: "king",
  steps: [
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

// ---------- 8. Castling ----------
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

// ---------- 9. En Passant ----------
const enPassantLesson: Lesson = {
  id: "en-passant",
  icon: "special",
  steps: [
    {
      narrationKey: "en_passant_intro",
      boardSetup: pos(
        ["e5", "pawn", "white"],
        ["d7", "pawn", "black"]
      ),
      animation: {
        piece: "d7" as Square,
        path: ["d5"] as Square[],
        highlights: ["d5", "d6"] as Square[],
      },
    },
    {
      narrationKey: "en_passant_capture",
      boardSetup: pos(
        ["e5", "pawn", "white"],
        ["d5", "pawn", "black"]
      ),
      animation: {
        piece: "e5" as Square,
        path: ["d6"] as Square[],
        highlights: ["d6"] as Square[],
      },
    },
  ],
  puzzles: [
    {
      narrationKey: "en_passant_puzzle",
      boardSetup: pos(
        ["e5", "pawn", "white"],
        ["d5", "pawn", "black"]
      ),
      correctMoves: [{ from: "e5" as Square, to: "d6" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "en_passant_puzzle_2",
      boardSetup: pos(
        ["c5", "pawn", "white"],
        ["d5", "pawn", "black"]
      ),
      correctMoves: [{ from: "c5" as Square, to: "d6" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- 10. Promotion ----------
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

// ---------- 11. Check & Checkmate ----------
const checkCheckmateLesson: Lesson = {
  id: "check-checkmate",
  icon: "king",
  steps: [
    {
      narrationKey: "check_intro",
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
      narrationKey: "checkmate_intro",
      boardSetup: pos(
        ["h8", "king", "black"],
        ["a8", "rook", "white"],
        ["g6", "king", "white"],
        ["b7", "rook", "white"]
      ),
    },
    {
      narrationKey: "checkmate_example",
      boardSetup: pos(
        ["e8", "king", "black"],
        ["d1", "queen", "white"],
        ["e1", "king", "white"]
      ),
      animation: {
        piece: "d1" as Square,
        path: ["d8"] as Square[],
        highlights: ["d8"] as Square[],
      },
    },
  ],
  puzzles: [
    {
      narrationKey: "check_puzzle",
      boardSetup: pos(
        ["e8", "king", "black"],
        ["a1", "rook", "white"],
        ["a2", "king", "white"]
      ),
      correctMoves: [{ from: "a1" as Square, to: "e1" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "checkmate_puzzle",
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

// ---------- 12. Forks ----------
const forksLesson: Lesson = {
  id: "forks",
  icon: "tactics",
  steps: [
    {
      narrationKey: "fork_intro",
      boardSetup: pos(
        ["e8", "king", "black"],
        ["a8", "rook", "black"],
        ["d5", "knight", "white"],
        ["e1", "king", "white"]
      ),
      animation: {
        piece: "d5" as Square,
        path: ["c7"] as Square[],
        highlights: ["e8", "a8"] as Square[],
      },
    },
    {
      narrationKey: "fork_explain",
      boardSetup: pos(
        ["e8", "king", "black"],
        ["a8", "rook", "black"],
        ["c7", "knight", "white"],
        ["e1", "king", "white"]
      ),
      animation: {
        piece: "c7" as Square,
        path: [] as Square[],
        highlights: ["e8", "a8"] as Square[],
      },
    },
  ],
  puzzles: [
    {
      narrationKey: "fork_puzzle",
      boardSetup: pos(
        ["e8", "king", "black"],
        ["h8", "rook", "black"],
        ["e5", "knight", "white"],
        ["e1", "king", "white"]
      ),
      correctMoves: [{ from: "e5" as Square, to: "g6" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "fork_puzzle_2",
      boardSetup: pos(
        ["d8", "king", "black"],
        ["f8", "rook", "black"],
        ["g4", "knight", "white"],
        ["e1", "king", "white"]
      ),
      correctMoves: [{ from: "g4" as Square, to: "e5" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- 13. Pins ----------
const pinsLesson: Lesson = {
  id: "pins",
  icon: "tactics",
  steps: [
    {
      narrationKey: "pin_intro",
      boardSetup: pos(
        ["e8", "king", "black"],
        ["e5", "knight", "black"],
        ["e1", "bishop", "white"],
        ["a1", "king", "white"]
      ),
      animation: {
        piece: "e1" as Square,
        path: [] as Square[],
        highlights: ["e5", "e8"] as Square[],
      },
    },
    {
      narrationKey: "pin_explain",
      boardSetup: pos(
        ["e8", "king", "black"],
        ["d6", "rook", "black"],
        ["b4", "bishop", "white"],
        ["a1", "king", "white"]
      ),
      animation: {
        piece: "b4" as Square,
        path: [] as Square[],
        highlights: ["d6", "e8"] as Square[],
      },
    },
  ],
  puzzles: [
    {
      narrationKey: "pin_puzzle",
      boardSetup: pos(
        ["e8", "king", "black"],
        ["e5", "queen", "black"],
        ["e1", "rook", "white"],
        ["a1", "king", "white"]
      ),
      correctMoves: [{ from: "e1" as Square, to: "e5" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
    {
      narrationKey: "pin_puzzle_2",
      boardSetup: pos(
        ["h5", "king", "black"],
        ["f5", "knight", "black"],
        ["a5", "rook", "white"],
        ["a1", "king", "white"]
      ),
      correctMoves: [{ from: "a5" as Square, to: "f5" as Square }],
      wrongMoveNarrationKey: "try_again",
      successNarrationKey: "great_move",
    },
  ],
  starsForChest: 2,
};

// ---------- Export ----------
export const LESSONS: Lesson[] = [
  boardIntro,
  pawnLesson,
  knightLesson,
  bishopLesson,
  rookLesson,
  queenLesson,
  kingLesson,
  castlingLesson,
  enPassantLesson,
  promotionLesson,
  checkCheckmateLesson,
  forksLesson,
  pinsLesson,
];

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
