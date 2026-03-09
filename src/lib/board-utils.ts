import type { Square, File, Rank } from "@/types/chess";

const FILES: File[] = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS: Rank[] = ["1", "2", "3", "4", "5", "6", "7", "8"];

export function squareToCoords(square: Square): { col: number; row: number } {
  const file = square[0] as File;
  const rank = square[1] as Rank;
  return { col: FILES.indexOf(file), row: 7 - RANKS.indexOf(rank) };
}

export function coordsToSquare(col: number, row: number): Square {
  return `${FILES[col]}${RANKS[7 - row]}` as Square;
}

export function isLightSquare(square: Square): boolean {
  const { col, row } = squareToCoords(square);
  return (col + row) % 2 === 0;
}

export function getAllSquares(): Square[] {
  const squares: Square[] = [];
  for (const rank of RANKS) {
    for (const file of FILES) {
      squares.push(`${file}${rank}` as Square);
    }
  }
  return squares;
}
