import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  BOARD_THEMES,
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
    return { boardTheme, pieceColors: DEFAULT_PIECE_COLORS };
  }, [activeChild?.activeBoardTheme]);
}
