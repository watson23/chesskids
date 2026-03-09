import type { PieceType, Square, ChessPiece } from "./chess";

export type LessonPhase = "watch" | "try" | "celebrate";

export interface LessonStep {
  narrationKey: string;
  boardSetup: Record<Square, ChessPiece>;
  animation?: {
    piece: Square;
    path: Square[];
    highlights?: Square[];
  };
}

export interface LessonPuzzle {
  narrationKey: string;
  boardSetup: Record<Square, ChessPiece>;
  correctMoves: { from: Square; to: Square }[];
  wrongMoveNarrationKey: string;
  successNarrationKey: string;
}

export interface Lesson {
  id: string;
  icon: PieceType | "board" | "special" | "tactics";
  pieceFocus?: PieceType;
  steps: LessonStep[];
  puzzles: LessonPuzzle[];
  starsForChest: number;
}

export interface PuzzleDefinition {
  id: string;
  category: PieceType | "checkmate" | "tactics";
  difficulty: 1 | 2 | 3;
  narrationKey: string;
  boardSetup: Record<Square, ChessPiece>;
  correctMoves: { from: Square; to: Square }[];
  wrongMoveNarrationKey: string;
  successNarrationKey: string;
}

export type RewardType = "board-theme" | "piece-color" | "celebration" | "sound-pack";

export interface Reward {
  id: string;
  type: RewardType;
  chestIndex: number;
  themeId?: string;
  pieceColorId?: string;
}

export interface ChestDefinition {
  index: number;
  starsRequired: number;
  rewards: Reward[];
  positionOnMap: number;
}
