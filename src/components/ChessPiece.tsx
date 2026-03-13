"use client";

import type { PieceType, PieceColor, PieceColorSet } from "@/types/chess";
import {
  PawnSVG,
  KnightSVG,
  BishopSVG,
  RookSVG,
  QueenSVG,
  KingSVG,
} from "@/lib/pieces";

const PIECE_COMPONENTS = {
  pawn: PawnSVG,
  knight: KnightSVG,
  bishop: BishopSVG,
  rook: RookSVG,
  queen: QueenSVG,
  king: KingSVG,
};

interface ChessPieceProps {
  type: PieceType;
  color: PieceColor;
  colorSet: PieceColorSet;
  size: number;
}

export default function ChessPiece({
  type,
  color,
  colorSet,
  size,
}: ChessPieceProps) {
  const fill = color === "white" ? colorSet.whiteColor : colorSet.blackColor;
  const stroke = color === "white" ? colorSet.whiteBorder : colorSet.blackBorder;
  const PieceSVG = PIECE_COMPONENTS[type];

  return <PieceSVG fill={fill} stroke={stroke} size={size} pieceColor={color} />;
}
