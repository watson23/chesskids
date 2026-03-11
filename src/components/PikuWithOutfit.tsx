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

/**
 * Per-expression offsets for the head slot overlay.
 * Each Piku pose has a slightly different head position/tilt,
 * so we fine-tune where head accessories land.
 * Values: { top%, left%, width scale factor }
 */
const HEAD_SLOT_DEFAULTS = { top: "-20%", left: "53%", widthScale: 0.6, rotate: 0 };

const headSlotOffsets: Partial<Record<StandingExpression, { top?: string; left?: string; widthScale?: number; rotate?: number }>> = {
  "standing-winking":      { top: "-17%", left: "49%" },
  "standing-celebrating":  { top: "-9%", left: "54%", widthScale: 0.52, rotate: 10 },
  "standing-neutral":      { left: "51%" },
  "standing-sad":          { top: "-18%", left: "50%" },
  "standing-holding-pawn": { left: "50%" },
  "standing-teaching":     { left: "50%" },
};

/**
 * Per-expression offsets for the body slot overlay.
 */
const BODY_SLOT_DEFAULTS = { top: "40%", left: "50%", widthScale: 0.7 };

const bodySlotOffsets: Partial<Record<StandingExpression, { top?: string; left?: string; widthScale?: number }>> = {
  // Add per-expression body offsets as needed
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

  // Resolve head slot position for this expression
  const headOverrides = headSlotOffsets[expression] ?? {};
  const head = {
    top: headOverrides.top ?? HEAD_SLOT_DEFAULTS.top,
    left: headOverrides.left ?? HEAD_SLOT_DEFAULTS.left,
    widthScale: headOverrides.widthScale ?? HEAD_SLOT_DEFAULTS.widthScale,
    rotate: headOverrides.rotate ?? HEAD_SLOT_DEFAULTS.rotate,
  };

  // Resolve body slot position for this expression
  const bodyOverrides = bodySlotOffsets[expression] ?? {};
  const body = {
    top: bodyOverrides.top ?? BODY_SLOT_DEFAULTS.top,
    left: bodyOverrides.left ?? BODY_SLOT_DEFAULTS.left,
    widthScale: bodyOverrides.widthScale ?? BODY_SLOT_DEFAULTS.widthScale,
  };

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
          width={Math.round(size * head.widthScale)}
          height={Math.round(size * head.widthScale * 0.63)}
          style={{
            position: "absolute",
            top: head.top,
            left: head.left,
            transform: `translateX(-50%) rotate(${head.rotate}deg)`,
            width: Math.round(size * head.widthScale),
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
          width={Math.round(size * body.widthScale)}
          height={Math.round(size * body.widthScale * 0.57)}
          style={{
            position: "absolute",
            top: body.top,
            left: body.left,
            transform: "translateX(-50%)",
            width: Math.round(size * body.widthScale),
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
