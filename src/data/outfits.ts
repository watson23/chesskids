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
  return ALL_OUTFITS.find((item) => item.id === id);
}

export function getOutfitsBySlot(slot: OutfitSlot): OutfitItem[] {
  return ALL_OUTFITS.filter((item) => item.slot === slot);
}
