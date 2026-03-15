import type { ChestDefinition } from "@/types/lesson";

/** Returns the chest that unlocks after completing the given lesson, or null */
export function getChestForLesson(lessonId: string): ChestDefinition | null {
  return CHESTS.find((c) => c.afterLesson === lessonId) ?? null;
}

export const CHESTS: ChestDefinition[] = [
  {
    index: 0,
    afterLesson: "pawn",
    rewards: [
      { id: "outfit-pink-bow", type: "outfit", chestIndex: 0, outfitId: "pink-bow" },
      { id: "outfit-blue-bow", type: "outfit", chestIndex: 0, outfitId: "blue-bow" },
    ],
    positionOnMap: 0.15,
  },
  {
    index: 1,
    afterLesson: "bishop",
    rewards: [
      { id: "outfit-mint-bow", type: "outfit", chestIndex: 1, outfitId: "mint-bow" },
      { id: "outfit-peach-bow", type: "outfit", chestIndex: 1, outfitId: "peach-bow" },
    ],
    positionOnMap: 0.35,
  },
  {
    index: 2,
    afterLesson: "queen",
    rewards: [
      { id: "outfit-purple-bow", type: "outfit", chestIndex: 2, outfitId: "purple-bow" },
      { id: "outfit-gold-bow", type: "outfit", chestIndex: 2, outfitId: "gold-bow" },
    ],
    positionOnMap: 0.55,
  },
  {
    index: 3,
    afterLesson: "checkmate",
    rewards: [
      { id: "outfit-wizard-hat", type: "outfit", chestIndex: 3, outfitId: "wizard-hat" },
    ],
    positionOnMap: 0.75,
  },
  {
    index: 4,
    afterLesson: "promotion",
    rewards: [
      { id: "outfit-medal-snowflake", type: "outfit", chestIndex: 4, outfitId: "medal-snowflake" },
    ],
    positionOnMap: 0.95,
  },
];
