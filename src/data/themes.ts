import type { BoardTheme, PieceColorSet } from "@/types/chess";

export const DEFAULT_BOARD_THEME: BoardTheme = {
  id: "classic",
  lightSquare: "#f5e6c8",
  darkSquare: "#b48764",
  name: "Classic",
};

export const BOARD_THEMES: BoardTheme[] = [
  DEFAULT_BOARD_THEME,
  { id: "forest", lightSquare: "#d4e6c3", darkSquare: "#5a8a3c", name: "Forest" },
  { id: "ocean", lightSquare: "#cce5f0", darkSquare: "#3a7ca5", name: "Ocean" },
  { id: "sunset", lightSquare: "#fde8d0", darkSquare: "#c76f3a", name: "Sunset" },
  { id: "candy", lightSquare: "#f8d7e8", darkSquare: "#c44b8e", name: "Candy" },
  { id: "arctic", lightSquare: "#e8f0f8", darkSquare: "#7a9cc6", name: "Arctic" },
];

export const DEFAULT_PIECE_COLORS: PieceColorSet = {
  id: "classic",
  whiteColor: "#fff8e7",
  whiteBorder: "#c8a96e",
  blackColor: "#4a4a5a",
  blackBorder: "#2a2a3a",
  name: "Classic",
};

export const PIECE_COLOR_SETS: PieceColorSet[] = [
  DEFAULT_PIECE_COLORS,
  {
    id: "gold",
    whiteColor: "#ffd700",
    whiteBorder: "#b8960f",
    blackColor: "#4a4a5a",
    blackBorder: "#2a2a3a",
    name: "Gold",
  },
  {
    id: "rainbow-w",
    whiteColor: "#ff9a9e",
    whiteBorder: "#c74b4f",
    blackColor: "#667eea",
    blackBorder: "#3b4fd4",
    name: "Rainbow",
  },
  {
    id: "nature",
    whiteColor: "#a8e6cf",
    whiteBorder: "#5cb88a",
    blackColor: "#845ec2",
    blackBorder: "#5a3d8a",
    name: "Nature",
  },
];
