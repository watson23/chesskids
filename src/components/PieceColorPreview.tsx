"use client";

import type { PieceColorSet } from "@/types/chess";
import ChessPiece from "@/components/ChessPiece";

interface PieceColorPreviewProps {
  colorSet: PieceColorSet;
  size?: number;
}

export default function PieceColorPreview({ colorSet, size = 48 }: PieceColorPreviewProps) {
  return (
    <div className="flex items-center gap-3">
      <ChessPiece type="king" color="white" colorSet={colorSet} size={size} />
      <ChessPiece type="queen" color="white" colorSet={colorSet} size={size} />
      <ChessPiece type="knight" color="white" colorSet={colorSet} size={size} />
    </div>
  );
}
