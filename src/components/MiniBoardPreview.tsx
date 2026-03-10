"use client";

import type { BoardTheme } from "@/types/chess";
import { PawnSVG } from "@/lib/pieces";

interface MiniBoardPreviewProps {
  theme: BoardTheme;
  size?: "sm" | "md";
}

export default function MiniBoardPreview({ theme, size = "md" }: MiniBoardPreviewProps) {
  const dim = size === "sm" ? "w-20 h-20" : "w-28 h-28";
  const pieceSize = size === "sm" ? 16 : 24;

  return (
    <div className={`grid grid-cols-4 grid-rows-4 ${dim} rounded-lg overflow-hidden shadow-md`}>
      {Array.from({ length: 16 }, (_, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const isLight = (row + col) % 2 === 0;
        const showPiece = row === 2 && col === 1;

        return (
          <div
            key={i}
            className="flex items-center justify-center"
            style={{ backgroundColor: isLight ? theme.lightSquare : theme.darkSquare }}
          >
            {showPiece && (
              <PawnSVG fill="#FFFFFF" stroke="#555555" size={pieceSize} />
            )}
          </div>
        );
      })}
    </div>
  );
}
