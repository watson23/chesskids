"use client";

import PikuWithOutfit from "@/components/PikuWithOutfit";

export default function OutfitTestPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center gap-8 p-8" style={{ background: "var(--ck-bg)" }}>
      <h1 className="text-2xl font-bold" style={{ color: "var(--ck-text)" }}>Outfit Test</h1>

      {/* Crown */}
      <h2 className="text-lg font-semibold" style={{ color: "var(--ck-text)" }}>Crown</h2>
      <div className="flex gap-8 flex-wrap justify-center">
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-happy" headImage="/outfits/head-crown.webp" size={200} />
          <span className="text-sm font-semibold">Happy</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-celebrating" headImage="/outfits/head-crown.webp" size={200} />
          <span className="text-sm font-semibold">Celebrating</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-winking" headImage="/outfits/head-crown.webp" size={200} />
          <span className="text-sm font-semibold">Winking</span>
        </div>
      </div>

      {/* Wizard Hat */}
      <h2 className="text-lg font-semibold" style={{ color: "var(--ck-text)" }}>Wizard Hat</h2>
      <div className="flex gap-8 flex-wrap justify-center">
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-happy" headImage="/outfits/head-wizard-hat.webp" size={200} />
          <span className="text-sm font-semibold">Happy</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-celebrating" headImage="/outfits/head-wizard-hat.webp" size={200} />
          <span className="text-sm font-semibold">Celebrating</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-winking" headImage="/outfits/head-wizard-hat.webp" size={200} />
          <span className="text-sm font-semibold">Winking</span>
        </div>
      </div>

      {/* Size comparison */}
      <h2 className="text-lg font-semibold" style={{ color: "var(--ck-text)" }}>Size comparison</h2>
      <div className="flex gap-4 items-end">
        <PikuWithOutfit expression="standing-happy" headImage="/outfits/head-crown.webp" size={72} />
        <PikuWithOutfit expression="standing-happy" headImage="/outfits/head-crown.webp" size={100} />
        <PikuWithOutfit expression="standing-happy" headImage="/outfits/head-wizard-hat.webp" size={150} />
      </div>
    </div>
  );
}
