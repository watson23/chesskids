import type { ChestDefinition } from "@/types/lesson";

export const CHESTS: ChestDefinition[] = [
  {
    index: 0,
    starsRequired: 6,
    rewards: [
      { id: "outfit-pink-bow", type: "outfit", chestIndex: 0, outfitId: "pink-bow" },
      { id: "outfit-blue-bow", type: "outfit", chestIndex: 0, outfitId: "blue-bow" },
    ],
    positionOnMap: 0.15,
  },
  {
    index: 1,
    starsRequired: 15,
    rewards: [
      { id: "outfit-mint-bow", type: "outfit", chestIndex: 1, outfitId: "mint-bow" },
      { id: "outfit-peach-bow", type: "outfit", chestIndex: 1, outfitId: "peach-bow" },
    ],
    positionOnMap: 0.35,
  },
  {
    index: 2,
    starsRequired: 24,
    rewards: [
      { id: "outfit-purple-bow", type: "outfit", chestIndex: 2, outfitId: "purple-bow" },
      { id: "outfit-gold-bow", type: "outfit", chestIndex: 2, outfitId: "gold-bow" },
    ],
    positionOnMap: 0.55,
  },
  {
    index: 3,
    starsRequired: 33,
    rewards: [
      { id: "outfit-wizard-hat", type: "outfit", chestIndex: 3, outfitId: "wizard-hat" },
    ],
    positionOnMap: 0.75,
  },
  {
    index: 4,
    starsRequired: 42,
    rewards: [
      { id: "outfit-medal-snowflake", type: "outfit", chestIndex: 4, outfitId: "medal-snowflake" },
    ],
    positionOnMap: 0.95,
  },
];
