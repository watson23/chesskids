import type { OutfitItem, OutfitSlot } from "@/types/lesson";

export const ALL_OUTFITS: OutfitItem[] = [
  // Head slot
  {
    id: "crown",
    slot: "head",
    nameKey: "outfit_crown",
    image: "/outfits/head-crown.webp",
  },
  {
    id: "knight-helmet",
    slot: "head",
    nameKey: "outfit_knight_helmet",
    image: "/outfits/head-knight-helmet.webp",
  },
  {
    id: "wizard-hat",
    slot: "head",
    nameKey: "outfit_wizard_hat",
    image: "/outfits/head-wizard-hat.webp",
    iconImage: "/outfits/head-wizard-hat-icon.webp",
  },
  {
    id: "pink-bow",
    slot: "head",
    nameKey: "outfit_pink_bow",
    image: "/outfits/head-pink-bow.webp",
  },
  {
    id: "winter-beanie",
    slot: "head",
    nameKey: "outfit_winter_beanie",
    image: "/outfits/head-winter-beanie.webp",
  },
  {
    id: "pirate-hat",
    slot: "head",
    nameKey: "outfit_pirate_hat",
    image: "/outfits/head-pirate-hat.webp",
  },
  {
    id: "champion-crown",
    slot: "head",
    nameKey: "outfit_champion_crown",
    image: "/outfits/head-champion-crown.webp",
  },

  // Body slot
  {
    id: "red-scarf",
    slot: "body",
    nameKey: "outfit_red_scarf",
    image: "/outfits/body-red-scarf.webp",
  },
  {
    id: "superhero-cape",
    slot: "body",
    nameKey: "outfit_superhero_cape",
    image: "/outfits/body-superhero-cape.webp",
  },
  {
    id: "bow-tie",
    slot: "body",
    nameKey: "outfit_bow_tie",
    image: "/outfits/body-bow-tie.webp",
  },
  {
    id: "knight-armor",
    slot: "body",
    nameKey: "outfit_knight_armor",
    image: "/outfits/body-knight-armor.webp",
  },
  {
    id: "rainbow-cape",
    slot: "body",
    nameKey: "outfit_rainbow_cape",
    image: "/outfits/body-rainbow-cape.webp",
  },
  {
    id: "snowflake-vest",
    slot: "body",
    nameKey: "outfit_snowflake_vest",
    image: "/outfits/body-snowflake-vest.webp",
  },
  {
    id: "champion-cape",
    slot: "body",
    nameKey: "outfit_champion_cape",
    image: "/outfits/body-champion-cape.webp",
  },
];

export function getOutfitItem(id: string): OutfitItem | undefined {
  // Prefer AVAILABLE_OUTFITS (has correct slots/images) over ALL_OUTFITS
  return AVAILABLE_OUTFITS.find((item) => item.id === id) ?? ALL_OUTFITS.find((item) => item.id === id);
}

export function getOutfitsBySlot(slot: OutfitSlot): OutfitItem[] {
  return ALL_OUTFITS.filter((item) => item.slot === slot);
}

/**
 * Outfits that have real images and working PikuWithOutfit positioning.
 * This is the list shown in the outfit picker UI.
 */
export const AVAILABLE_OUTFITS: OutfitItem[] = [
  // Head
  { id: "crown", slot: "head", nameKey: "outfit_crown", image: "/outfits/head-crown.webp" },
  { id: "wizard-hat", slot: "head", nameKey: "outfit_wizard_hat", image: "/outfits/head-wizard-hat.webp", iconImage: "/outfits/head-wizard-hat-icon.webp" },
  // Body
  { id: "pink-bow", slot: "body", nameKey: "outfit_pink_bow", image: "/outfits/body-pink-bow.webp" },
  { id: "purple-bow", slot: "body", nameKey: "outfit_purple_bow", image: "/outfits/body-purple-bow.webp" },
  { id: "blue-bow", slot: "body", nameKey: "outfit_blue_bow", image: "/outfits/body-blue-bow.webp" },
  { id: "mint-bow", slot: "body", nameKey: "outfit_mint_bow", image: "/outfits/body-mint-bow.webp" },
  { id: "gold-bow", slot: "body", nameKey: "outfit_gold_bow", image: "/outfits/body-gold-bow.webp" },
  { id: "peach-bow", slot: "body", nameKey: "outfit_peach_bow", image: "/outfits/body-peach-bow.webp" },
  { id: "medal-snowflake", slot: "body", nameKey: "outfit_medal_snowflake", image: "/outfits/body-medal-snowflake.webp" },
];

export function getAvailableBySlot(slot: OutfitSlot): OutfitItem[] {
  return AVAILABLE_OUTFITS.filter((item) => item.slot === slot);
}

/** Check if an outfit is a chest reward (i.e. needs to be unlocked) */
export function isChestReward(outfitId: string): boolean {
  // Import would create circular dep, so just check the naming convention
  // Chest rewards use "outfit-{id}" format in unlockedRewards
  // All chest-gated outfits are defined in chests.ts — we hardcode the set here
  const CHEST_OUTFIT_IDS = new Set([
    "pink-bow", "blue-bow", "mint-bow", "peach-bow",
    "purple-bow", "gold-bow", "wizard-hat", "medal-snowflake",
  ]);
  return CHEST_OUTFIT_IDS.has(outfitId);
}
