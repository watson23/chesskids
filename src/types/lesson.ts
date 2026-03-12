import type { PieceType, Square, ChessPiece } from "./chess";
import type { LocaleKey } from "./locale";

export type LessonPhase = "watch" | "try" | "celebrate";

export interface LessonStep {
  narrationKey: LocaleKey;
  boardSetup: Record<Square, ChessPiece>;
  animation?: {
    piece: Square;
    path: Square[];
    highlights?: Square[];
  };
}

export interface LessonPuzzle {
  narrationKey: LocaleKey;
  boardSetup: Record<Square, ChessPiece>;
  correctMoves: { from: Square; to: Square }[];
  wrongMoveNarrationKey: LocaleKey;
  successNarrationKey: LocaleKey;
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
  narrationKey: LocaleKey;
  boardSetup: Record<Square, ChessPiece>;
  correctMoves: { from: Square; to: Square }[];
  wrongMoveNarrationKey: LocaleKey;
  successNarrationKey: LocaleKey;
}

export type RewardType = "board-theme" | "piece-color" | "celebration" | "sound-pack" | "outfit";

export type OutfitSlot = "head" | "body";

export interface OutfitItem {
  id: string;
  slot: OutfitSlot;
  nameKey: string;
  image: string;
  /** Optional centered icon for the outfit selector (when main image is positioned for character) */
  iconImage?: string;
}

export interface Reward {
  id: string;
  type: RewardType;
  chestIndex: number;
  themeId?: string;
  pieceColorId?: string;
  outfitId?: string;
}

export interface ChestDefinition {
  index: number;
  starsRequired: number;
  rewards: Reward[];
  positionOnMap: number;
}
