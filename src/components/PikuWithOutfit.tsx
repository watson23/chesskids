"use client";

import Image from "next/image";

type StandingExpression =
  | "standing-happy"
  | "standing-celebrating"
  | "standing-neutral"
  | "standing-winking"
  | "standing-sad"
  | "standing-holding-pawn"
  | "standing-teaching";

const standingExpressionToImage: Record<StandingExpression, string> = {
  "standing-happy": "/mascot/piku-standing-happy.webp",
  "standing-celebrating": "/mascot/piku-standing-celebrating.webp",
  "standing-neutral": "/mascot/piku-standing-neutral.webp",
  "standing-winking": "/mascot/piku-standing-winking.webp",
  "standing-sad": "/mascot/piku-standing-sad-1.webp",
  "standing-holding-pawn": "/mascot/piku-standing-holding-chess-piece-1.webp",
  "standing-teaching": "/mascot/piku-standing-teaching.webp",
};

interface PikuWithOutfitProps {
  expression?: StandingExpression;
  headImage?: string; // e.g. "/outfits/head-crown.webp"
  bodyImage?: string; // e.g. "/outfits/body-red-scarf.webp"
  size?: number; // base Piku size in px, default 100
}

export default function PikuWithOutfit({
  expression = "standing-happy",
  headImage,
  bodyImage,
  size = 100,
}: PikuWithOutfitProps) {
  const src = standingExpressionToImage[expression];

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
      }}
    >
      {/* Base standing Piku */}
      <Image
        src={src}
        alt={`Piku the penguin — ${expression}`}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          pointerEvents: "none",
        }}
        priority={size >= 100}
        draggable={false}
      />

      {/* Head overlay (e.g. crown, hat) */}
      {headImage && (
        <Image
          src={headImage}
          alt="Piku head accessory"
          width={Math.round(size * 0.6)}
          height={Math.round(size * 0.3)}
          style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: Math.round(size * 0.6),
            height: "auto",
            objectFit: "contain",
            pointerEvents: "none",
          }}
          draggable={false}
        />
      )}

      {/* Body overlay (e.g. scarf, cape) */}
      {bodyImage && (
        <Image
          src={bodyImage}
          alt="Piku body accessory"
          width={Math.round(size * 0.7)}
          height={Math.round(size * 0.4)}
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translateX(-50%)",
            width: Math.round(size * 0.7),
            height: "auto",
            objectFit: "contain",
            pointerEvents: "none",
          }}
          draggable={false}
        />
      )}
    </div>
  );
}

export type { StandingExpression, PikuWithOutfitProps };
