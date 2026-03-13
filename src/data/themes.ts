import type { BoardTheme, PieceColorSet } from "@/types/chess";

export const DEFAULT_BOARD_THEME: BoardTheme = {
  id: "classic",
  lightSquare: "#EDE9FE",
  darkSquare: "#A78BFA",
  name: "Classic",
};

export const BOARD_THEMES: BoardTheme[] = [
  DEFAULT_BOARD_THEME,
  { id: "wooden", lightSquare: "#F0E6D8", darkSquare: "#B49E86", name: "Wooden" },
  { id: "forest", lightSquare: "#D8E8D0", darkSquare: "#8AAF78", name: "Forest" },
  { id: "ocean", lightSquare: "#D0E4F0", darkSquare: "#6FA0BD", name: "Ocean" },
  { id: "sunset", lightSquare: "#F0DDD0", darkSquare: "#C49478", name: "Sunset" },
  { id: "candy", lightSquare: "#F0D8E4", darkSquare: "#C080A0", name: "Candy" },
  { id: "lavender", lightSquare: "#f3eff8", darkSquare: "#B8A9C9", name: "Lavender" },
  { id: "arctic", lightSquare: "#E0ECF4", darkSquare: "#88AAC4", name: "Arctic" },
];

export const DEFAULT_PIECE_COLORS: PieceColorSet = {
  id: "classic",
  whiteColor: "#FFFFFF",
  whiteBorder: "#555555",
  blackColor: "#333333",
  blackBorder: "#111111",
  name: "Classic",
};

