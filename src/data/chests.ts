import type { ChestDefinition } from "@/types/lesson";

export const CHESTS: ChestDefinition[] = [
  {
    index: 0,
    starsRequired: 4,
    rewards: [
      { id: "outfit-winter-beanie", type: "outfit", chestIndex: 0, outfitId: "winter-beanie" },
    ],
    positionOnMap: 0.05,
  },
  {
    index: 1,
    starsRequired: 8,
    rewards: [
      { id: "outfit-red-scarf", type: "outfit", chestIndex: 1, outfitId: "red-scarf" },
    ],
    positionOnMap: 0.15,
  },
  {
    index: 2,
    starsRequired: 12,
    rewards: [
      { id: "outfit-pink-bow", type: "outfit", chestIndex: 2, outfitId: "pink-bow" },
      { id: "theme-forest", type: "board-theme", chestIndex: 2, themeId: "forest" },
    ],
    positionOnMap: 0.25,
  },
  {
    index: 3,
    starsRequired: 16,
    rewards: [
      { id: "outfit-superhero-cape", type: "outfit", chestIndex: 3, outfitId: "superhero-cape" },
    ],
    positionOnMap: 0.35,
  },
  {
    index: 4,
    starsRequired: 18,
    rewards: [
      { id: "outfit-knight-helmet", type: "outfit", chestIndex: 4, outfitId: "knight-helmet" },
      { id: "pieces-gold", type: "piece-color", chestIndex: 4, pieceColorId: "gold" },
    ],
    positionOnMap: 0.45,
  },
  {
    index: 5,
    starsRequired: 22,
    rewards: [
      { id: "outfit-bow-tie", type: "outfit", chestIndex: 5, outfitId: "bow-tie" },
      { id: "theme-ocean", type: "board-theme", chestIndex: 5, themeId: "ocean" },
    ],
    positionOnMap: 0.55,
  },
  {
    index: 6,
    starsRequired: 26,
    rewards: [
      { id: "outfit-wizard-hat", type: "outfit", chestIndex: 6, outfitId: "wizard-hat" },
    ],
    positionOnMap: 0.65,
  },
  {
    index: 7,
    starsRequired: 30,
    rewards: [
      { id: "outfit-rainbow-cape", type: "outfit", chestIndex: 7, outfitId: "rainbow-cape" },
      { id: "pieces-rainbow", type: "piece-color", chestIndex: 7, pieceColorId: "rainbow-w" },
    ],
    positionOnMap: 0.75,
  },
  {
    index: 8,
    starsRequired: 34,
    rewards: [
      { id: "outfit-pirate-hat", type: "outfit", chestIndex: 8, outfitId: "pirate-hat" },
      { id: "theme-candy", type: "board-theme", chestIndex: 8, themeId: "candy" },
    ],
    positionOnMap: 0.85,
  },
  {
    index: 9,
    starsRequired: 38,
    rewards: [
      { id: "outfit-knight-armor", type: "outfit", chestIndex: 9, outfitId: "knight-armor" },
      { id: "theme-arctic", type: "board-theme", chestIndex: 9, themeId: "arctic" },
    ],
    positionOnMap: 0.95,
  },
];
