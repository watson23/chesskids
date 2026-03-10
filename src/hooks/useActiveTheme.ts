import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  BOARD_THEMES,
  PIECE_COLOR_SETS,
  DEFAULT_BOARD_THEME,
  DEFAULT_PIECE_COLORS,
} from "@/data/themes";
import type { BoardTheme, PieceColorSet } from "@/types/chess";

interface ActiveTheme {
  boardTheme: BoardTheme;
  pieceColors: PieceColorSet;
}

export function useActiveTheme(): ActiveTheme {
  const { activeChild } = useAuth();

  return useMemo(() => {
    const boardTheme =
      BOARD_THEMES.find((t) => t.id === activeChild?.activeBoardTheme) ??
      DEFAULT_BOARD_THEME;
    const pieceColors =
      PIECE_COLOR_SETS.find((p) => p.id === activeChild?.activePieceColor) ??
      DEFAULT_PIECE_COLORS;
    return { boardTheme, pieceColors };
  }, [activeChild?.activeBoardTheme, activeChild?.activePieceColor]);
}
