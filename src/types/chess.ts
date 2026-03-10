export type PieceType = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";
export type PieceColor = "white" | "black";

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export type File = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
export type Rank = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
export type Square = `${File}${Rank}`;

export interface BoardTheme {
  id: string;
  lightSquare: string;
  darkSquare: string;
  name: string;
}

export interface PieceColorSet {
  id: string;
  whiteColor: string;
  whiteBorder: string;
  blackColor: string;
  blackBorder: string;
  name: string;
}

export type AIDifficulty = 1 | 2 | 3 | 4;

export interface GameState {
  selectedSquare: Square | null;
  validMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  isGameOver: boolean;
  result: "win" | "loss" | "draw" | null;
}
