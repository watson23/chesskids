import type { BoardTheme, PieceColorSet } from "@/types/chess";

export const DEFAULT_BOARD_THEME: BoardTheme = {
  id: "classic",
  lightSquare: "#EDE9FE",
  darkSquare: "#A78BFA",
  name: "Classic",
};

export const BOARD_THEMES: BoardTheme[] = [
  DEFAULT_BOARD_THEME,
  { id: "wooden", lightSquare: "#f5e6c8", darkSquare: "#b48764", name: "Wooden" },
  { id: "forest", lightSquare: "#d4e6c3", darkSquare: "#5a8a3c", name: "Forest" },
  { id: "ocean", lightSquare: "#cce5f0", darkSquare: "#3a7ca5", name: "Ocean" },
  { id: "sunset", lightSquare: "#fde8d0", darkSquare: "#c76f3a", name: "Sunset" },
  { id: "candy", lightSquare: "#f8d7e8", darkSquare: "#c44b8e", name: "Candy" },
  { id: "lavender", lightSquare: "#f3eff8", darkSquare: "#B8A9C9", name: "Lavender" },
  { id: "arctic", lightSquare: "#e8f0f8", darkSquare: "#7a9cc6", name: "Arctic" },
];

export const DEFAULT_PIECE_COLORS: PieceColorSet = {
  id: "classic",
  whiteColor: "#FFFFFF",
  whiteBorder: "#555555",
  blackColor: "#333333",
  blackBorder: "#111111",
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
    id: "coral",
    whiteColor: "#F4845F",
    whiteBorder: "#D66A47",
    blackColor: "#667eea",
    blackBorder: "#3b4fd4",
    name: "Coral & Blue",
  },
  {
    id: "nature",
    whiteColor: "#a8e6cf",
    whiteBorder: "#5cb88a",
    blackColor: "#845ec2",
    blackBorder: "#5a3d8a",
    name: "Nature",
  },
  {
    id: "rainbow-w",
    whiteColor: "#FF6B8A",
    whiteBorder: "#D44A6A",
    blackColor: "#6C5CE7",
    blackBorder: "#4A3DB5",
    name: "Rainbow",
  },
];
