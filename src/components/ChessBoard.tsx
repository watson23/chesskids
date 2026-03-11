"use client";

import { useCallback, useEffect, useRef, useState, memo } from "react";
import type {
  Square,
  ChessPiece as ChessPieceType,
  BoardTheme,
  PieceColorSet,
} from "@/types/chess";
import { coordsToSquare, isLightSquare } from "@/lib/board-utils";
import ChessPiece from "./ChessPiece";

interface ChessBoardProps {
  pieces: Record<string, ChessPieceType>;
  theme: BoardTheme;
  pieceColors: PieceColorSet;
  selectedSquare: Square | null;
  validMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  onSquareTap: (square: Square) => void;
  flipped?: boolean;
  interactive?: boolean;
}

interface BoardSquareProps {
  square: Square;
  piece: ChessPieceType | undefined;
  fadingPiece: ChessPieceType | undefined;
  bgColor: string;
  isSelected: boolean;
  isValidMove: boolean;
  interactive: boolean;
  pieceColors: PieceColorSet;
  onTap: (square: Square) => void;
}

const BoardSquare = memo(function BoardSquare({
  square,
  piece,
  fadingPiece,
  bgColor,
  isSelected,
  isValidMove,
  interactive,
  pieceColors,
  onTap,
}: BoardSquareProps) {
  const hasPiece = piece !== undefined;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ backgroundColor: bgColor }}
      onClick={() => interactive && onTap(square)}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={`Square ${square}${hasPiece ? `, ${piece.color} ${piece.type}` : ""}`}
      onKeyDown={(e) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onTap(square);
        }
      }}
    >
      {/* Fading captured piece */}
      {fadingPiece && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-capture-fade">
          <div className="w-[92%] h-[92%] flex items-center justify-center">
            <ChessPiece
              type={fadingPiece.type}
              color={fadingPiece.color}
              colorSet={pieceColors}
              size={100}
            />
          </div>
        </div>
      )}

      {/* Piece */}
      {hasPiece && (
        <div className="w-[92%] h-[92%] flex items-center justify-center pointer-events-none">
          <ChessPiece
            type={piece.type}
            color={piece.color}
            colorSet={pieceColors}
            size={100}
          />
        </div>
      )}

      {/* Valid move indicator */}
      {isValidMove && !hasPiece && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[38%] h-[38%] rounded-full"
            style={{
              background: "radial-gradient(circle, #6EE7B7 0%, #34D399 100%)",
              boxShadow: "0 0 8px rgba(110, 231, 183, 0.6), 0 2px 4px rgba(0,0,0,0.15)",
            }}
          />
        </div>
      )}

      {/* Valid capture indicator (ring around capturable piece) */}
      {isValidMove && hasPiece && (
        <div
          className="absolute inset-[3%] rounded-full pointer-events-none"
          style={{
            border: "5px solid #F472B6",
            boxShadow: "inset 0 0 8px rgba(244, 114, 182, 0.4), 0 0 8px rgba(244, 114, 182, 0.3)",
          }}
        />
      )}
    </div>
  );
});

export default function ChessBoard({
  pieces,
  theme,
  pieceColors,
  selectedSquare,
  validMoves,
  lastMove,
  onSquareTap,
  flipped = false,
  interactive = true,
}: ChessBoardProps) {
  const handleSquareTap = useCallback(
    (square: Square) => {
      if (interactive) {
        onSquareTap(square);
      }
    },
    [interactive, onSquareTap]
  );

  // Track captured pieces for fade-out animation
  const prevPiecesRef = useRef(pieces);
  const [fadingPieces, setFadingPieces] = useState<Record<string, ChessPieceType>>({});

  useEffect(() => {
    const prev = prevPiecesRef.current;
    const fading: Record<string, ChessPieceType> = {};
    for (const sq of Object.keys(prev)) {
      // Piece was on this square before but now a DIFFERENT piece is there (capture)
      if (pieces[sq] && prev[sq] && pieces[sq].color !== prev[sq].color) {
        fading[sq] = prev[sq];
      }
    }
    prevPiecesRef.current = pieces;
    if (Object.keys(fading).length > 0) {
      setFadingPieces(fading);
      const timer = setTimeout(() => setFadingPieces({}), 350);
      return () => clearTimeout(timer);
    }
  }, [pieces]);

  const rows = Array.from({ length: 8 }, (_, i) => i);
  const cols = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="aspect-square w-full max-w-[min(85vw,48vh)]">
      <div className="grid grid-cols-8 grid-rows-8 h-full w-full rounded-xl overflow-hidden shadow-lg">
        {rows.map((row) => {
          const displayRow = flipped ? 7 - row : row;
          return cols.map((col) => {
            const displayCol = flipped ? 7 - col : col;
            const square = coordsToSquare(displayCol, displayRow);
            const light = isLightSquare(square);
            const piece = pieces[square];
            const isSelected = selectedSquare === square;
            const isValidMove = validMoves.includes(square);
            const isLastMove =
              lastMove !== null &&
              (lastMove.from === square || lastMove.to === square);

            let bgColor: string;
            if (isSelected) {
              bgColor = "#fbbf24"; // amber-400
            } else if (isLastMove) {
              bgColor = light
                ? blendColors(theme.lightSquare, "#fbbf24", 0.25)
                : blendColors(theme.darkSquare, "#fbbf24", 0.25);
            } else {
              bgColor = light ? theme.lightSquare : theme.darkSquare;
            }

            return (
              <BoardSquare
                key={`${displayRow}-${displayCol}`}
                square={square}
                piece={piece}
                fadingPiece={fadingPieces[square]}
                bgColor={bgColor}
                isSelected={isSelected}
                isValidMove={isValidMove}
                interactive={interactive}
                pieceColors={pieceColors}
                onTap={handleSquareTap}
              />
            );
          });
        })}
      </div>
    </div>
  );
}

/**
 * Simple color blending for last-move highlight.
 * Blends hex color `a` toward hex color `b` by `t` (0..1).
 */
function blendColors(a: string, b: string, t: number): string {
  const parseHex = (hex: string) => {
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16),
    };
  };

  const ca = parseHex(a);
  const cb = parseHex(b);

  const r = Math.round(ca.r + (cb.r - ca.r) * t);
  const g = Math.round(ca.g + (cb.g - ca.g) * t);
  const bl = Math.round(ca.b + (cb.b - ca.b) * t);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}
