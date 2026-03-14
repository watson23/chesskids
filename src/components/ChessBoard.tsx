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
  correctMoves?: Square[];
  watchHighlights?: Square[];
  lastMove: { from: Square; to: Square } | null;
  onSquareTap: (square: Square) => void;
  onWatchTap?: () => void;
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
  isCorrectMove: boolean;
  isWatchHighlight: boolean;
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
  isCorrectMove,
  isWatchHighlight,
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

      {/* Correct move indicator — golden pulsing dot/ring (lessons & puzzles) */}
      {isCorrectMove && !hasPiece && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[44%] h-[44%] rounded-full animate-correct-move-pulse"
            style={{
              background: "radial-gradient(circle, #FDE68A 0%, #F59E0B 100%)",
              boxShadow: "0 0 14px rgba(245, 158, 11, 0.7), 0 0 6px rgba(253, 230, 138, 0.5), 0 2px 4px rgba(0,0,0,0.15)",
            }}
          />
        </div>
      )}

      {isCorrectMove && hasPiece && (
        <div
          className="absolute inset-[3%] rounded-full pointer-events-none animate-correct-move-pulse"
          style={{
            border: "5px solid #F59E0B",
            boxShadow: "inset 0 0 10px rgba(245, 158, 11, 0.4), 0 0 12px rgba(245, 158, 11, 0.5)",
          }}
        />
      )}

      {/* Watch highlight — soft blue glow (observe, don't tap) */}
      {isWatchHighlight && !hasPiece && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[40%] h-[40%] rounded-full animate-watch-highlight-pulse"
            style={{
              background: "radial-gradient(circle, #93C5FD 0%, #3B82F6 100%)",
              boxShadow: "0 0 12px rgba(59, 130, 246, 0.6), 0 0 6px rgba(147, 197, 253, 0.4)",
            }}
          />
        </div>
      )}

      {isWatchHighlight && hasPiece && (
        <div
          className="absolute inset-[3%] rounded-full pointer-events-none animate-watch-highlight-pulse"
          style={{
            border: "5px solid #3B82F6",
            boxShadow: "inset 0 0 10px rgba(59, 130, 246, 0.3), 0 0 12px rgba(59, 130, 246, 0.4)",
          }}
        />
      )}

      {/* Legal move indicator — subtle green dot (not correct, just legal) */}
      {isValidMove && !isCorrectMove && !hasPiece && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[30%] h-[30%] rounded-full"
            style={{
              background: "radial-gradient(circle, #9CA3AF 0%, #6B7280 100%)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              opacity: 0.5,
            }}
          />
        </div>
      )}

      {/* Legal capture indicator — subtle ring (not correct, just legal) */}
      {isValidMove && !isCorrectMove && hasPiece && (
        <div
          className="absolute inset-[3%] rounded-full pointer-events-none"
          style={{
            border: "4px solid #9CA3AF",
            opacity: 0.4,
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
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
  correctMoves = [],
  watchHighlights = [],
  lastMove,
  onSquareTap,
  onWatchTap,
  flipped = false,
  interactive = true,
}: ChessBoardProps) {
  const handleSquareTap = useCallback(
    (square: Square) => {
      if (interactive) {
        onSquareTap(square);
      } else if (onWatchTap) {
        onWatchTap();
      }
    },
    [interactive, onSquareTap, onWatchTap]
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
            const isCorrectMove = correctMoves.includes(square);
            const isWatchHighlight = watchHighlights.includes(square);
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
                isCorrectMove={isCorrectMove}
                isWatchHighlight={isWatchHighlight}
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
