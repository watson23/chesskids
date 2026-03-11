"use client";

import PikuWithOutfit from "@/components/PikuWithOutfit";

export default function OutfitTestPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-8 p-8" style={{ background: "var(--ck-bg)" }}>
      <h1 className="text-2xl font-bold" style={{ color: "var(--ck-text)" }}>Outfit Test</h1>

      <div className="flex gap-8 flex-wrap justify-center">
        {/* No outfit */}
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-happy" size={200} />
          <span className="text-sm font-semibold">No outfit</span>
        </div>

        {/* Crown only */}
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit
            expression="standing-happy"
            headImage="/outfits/head-crown.webp"
            size={200}
          />
          <span className="text-sm font-semibold">Crown</span>
        </div>

        {/* Crown on celebrating */}
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit
            expression="standing-celebrating"
            headImage="/outfits/head-crown.webp"
            size={200}
          />
          <span className="text-sm font-semibold">Crown (celebrating)</span>
        </div>

        {/* Crown on winking */}
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit
            expression="standing-winking"
            headImage="/outfits/head-crown.webp"
            size={200}
          />
          <span className="text-sm font-semibold">Crown (winking)</span>
        </div>
      </div>

      {/* Smaller sizes */}
      <div className="flex gap-4 items-end">
        <PikuWithOutfit expression="standing-happy" headImage="/outfits/head-crown.webp" size={72} />
        <PikuWithOutfit expression="standing-happy" headImage="/outfits/head-crown.webp" size={100} />
        <PikuWithOutfit expression="standing-happy" headImage="/outfits/head-crown.webp" size={150} />
      </div>
    </div>
  );
}
