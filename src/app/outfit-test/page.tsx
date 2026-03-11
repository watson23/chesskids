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

      {/* Wizard Hat — other expressions */}
      <h2 className="text-lg font-semibold" style={{ color: "var(--ck-text)" }}>Wizard Hat — Other Expressions</h2>
      <div className="flex gap-8 flex-wrap justify-center">
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-neutral" headImage="/outfits/head-wizard-hat.webp" size={200} />
          <span className="text-sm font-semibold">Neutral</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-sad" headImage="/outfits/head-wizard-hat.webp" size={200} />
          <span className="text-sm font-semibold">Sad</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-holding-pawn" headImage="/outfits/head-wizard-hat.webp" size={200} />
          <span className="text-sm font-semibold">Holding Pawn</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-teaching" headImage="/outfits/head-wizard-hat.webp" size={200} />
          <span className="text-sm font-semibold">Teaching</span>
        </div>
      </div>

      {/* Pink Bow (body) */}
      <h2 className="text-lg font-semibold" style={{ color: "var(--ck-text)" }}>Pink Bow (body)</h2>
      <div className="flex gap-8 flex-wrap justify-center">
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-happy" bodyImage="/outfits/body-pink-bow.webp" size={200} />
          <span className="text-sm font-semibold">Happy</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-happy" headImage="/outfits/head-crown.webp" bodyImage="/outfits/body-pink-bow.webp" size={200} />
          <span className="text-sm font-semibold">Happy + Crown</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-celebrating" bodyImage="/outfits/body-pink-bow.webp" size={200} />
          <span className="text-sm font-semibold">Celebrating</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-winking" bodyImage="/outfits/body-pink-bow.webp" size={200} />
          <span className="text-sm font-semibold">Winking</span>
        </div>
      </div>

      {/* Snowflake Medal */}
      <h2 className="text-lg font-semibold" style={{ color: "var(--ck-text)" }}>Snowflake Medal</h2>
      <div className="flex gap-8 flex-wrap justify-center">
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-happy" bodyImage="/outfits/body-medal-snowflake.webp" size={200} />
          <span className="text-sm font-semibold">Happy</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-happy" headImage="/outfits/head-crown.webp" bodyImage="/outfits/body-medal-snowflake.webp" size={200} />
          <span className="text-sm font-semibold">Happy + Crown</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-celebrating" bodyImage="/outfits/body-medal-snowflake.webp" size={200} />
          <span className="text-sm font-semibold">Celebrating</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PikuWithOutfit expression="standing-winking" bodyImage="/outfits/body-medal-snowflake.webp" size={200} />
          <span className="text-sm font-semibold">Winking</span>
        </div>
      </div>

      {/* All Bow Colors */}
      <h2 className="text-lg font-semibold" style={{ color: "var(--ck-text)" }}>Bow Colors</h2>
      <div className="flex gap-6 flex-wrap justify-center">
        {["pink", "purple", "blue", "mint", "gold", "peach"].map((color) => (
          <div key={color} className="flex flex-col items-center gap-2">
            <PikuWithOutfit expression="standing-happy" bodyImage={`/outfits/body-${color}-bow.webp`} size={140} />
            <span className="text-sm font-semibold capitalize">{color}</span>
          </div>
        ))}
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
