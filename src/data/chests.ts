import type { ChestDefinition } from "@/types/lesson";

export const CHESTS: ChestDefinition[] = [
  {
    index: 0,
    starsRequired: 6,
    rewards: [
      { id: "theme-forest", type: "board-theme", chestIndex: 0, themeId: "forest" },
    ],
    positionOnMap: 0.15,
  },
  {
    index: 1,
    starsRequired: 15,
    rewards: [
      { id: "pieces-gold", type: "piece-color", chestIndex: 1, pieceColorId: "gold" },
    ],
    positionOnMap: 0.35,
  },
  {
    index: 2,
    starsRequired: 24,
    rewards: [
      { id: "theme-ocean", type: "board-theme", chestIndex: 2, themeId: "ocean" },
    ],
    positionOnMap: 0.55,
  },
  {
    index: 3,
    starsRequired: 33,
    rewards: [
      {
        id: "pieces-rainbow",
        type: "piece-color",
        chestIndex: 3,
        pieceColorId: "rainbow-w",
      },
    ],
    positionOnMap: 0.75,
  },
  {
    index: 4,
    starsRequired: 39,
    rewards: [
      { id: "theme-candy", type: "board-theme", chestIndex: 4, themeId: "candy" },
      { id: "theme-arctic", type: "board-theme", chestIndex: 4, themeId: "arctic" },
    ],
    positionOnMap: 0.95,
  },
];
