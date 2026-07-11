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

type SlotPos = { top: string; left: string; widthScale: number; rotate: number };
type PartialPos = Partial<SlotPos>;

/**
 * Head slot positioning per item, with optional per-expression overrides.
 * Each item defines a `base` position plus expression-specific tweaks.
 * Resolution: item.expressions[expr] → item.base → DEFAULTS
 */
const HEAD_DEFAULTS: SlotPos = { top: "-20%", left: "53%", widthScale: 0.6, rotate: 0 };

const headSlotConfig: Record<string, { base: PartialPos; expressions?: Partial<Record<StandingExpression, PartialPos>> }> = {
  "head-crown": {
    base: {},
    expressions: {
      "standing-happy":        { left: "55%", rotate: 3 },
      "standing-winking":      { top: "-17%", left: "49%" },
      "standing-celebrating":  { top: "-9%", left: "54%", widthScale: 0.52, rotate: 10 },
      "standing-neutral":      { left: "51%" },
      "standing-sad":          { top: "-18%", left: "50%" },
      "standing-holding-pawn": { left: "50%" },
      "standing-teaching":     { left: "50%" },
    },
  },
  "head-wizard-hat": {
    base: { top: "-32.5%", left: "47%", widthScale: 0.85, rotate: 4 },
    expressions: {
      "standing-winking":      { top: "-30%", left: "40%", rotate: -2 },
      "standing-celebrating":  { top: "-19.5%", left: "47%", widthScale: 0.72, rotate: 12 },
    },
  },
  // Extracted via design/extract_outfit.py — base values are exact for standing-neutral
  "head-magician-hat": {
    base: { top: "-18.9%", left: "45.8%", widthScale: 0.47, rotate: 0 },
    expressions: {
      "standing-happy":       { top: "-18%", left: "54%", rotate: 3 },
      "standing-celebrating": { top: "-6%", left: "54%", widthScale: 0.41, rotate: 10 },
      "standing-winking":     { top: "-16%", left: "45%", rotate: -3 },
    },
  },
};

function resolveHeadPos(itemKey: string, expression: StandingExpression): SlotPos {
  const config = headSlotConfig[itemKey];
  if (!config) return HEAD_DEFAULTS;
  const exprOvr = config.expressions?.[expression] ?? {};
  const base = config.base;
  return {
    top: exprOvr.top ?? base.top ?? HEAD_DEFAULTS.top,
    left: exprOvr.left ?? base.left ?? HEAD_DEFAULTS.left,
    widthScale: exprOvr.widthScale ?? base.widthScale ?? HEAD_DEFAULTS.widthScale,
    rotate: exprOvr.rotate ?? base.rotate ?? HEAD_DEFAULTS.rotate,
  };
}

/**
 * Body slot positioning (same structure, ready for when body items arrive).
 */
const BODY_DEFAULTS: SlotPos = { top: "40%", left: "50%", widthScale: 0.35, rotate: 0 };

const BOW_CONFIG = {
  base: { top: "37.5%", left: "50%", widthScale: 0.35, rotate: 3 } as PartialPos,
  expressions: {
    "standing-celebrating": { top: "41.5%", left: "46%", rotate: 5 },
    "standing-winking": { top: "41%", left: "46%", rotate: -2 },
  } as Partial<Record<StandingExpression, PartialPos>>,
};

const bodySlotConfig: Record<string, { base: PartialPos; expressions?: Partial<Record<StandingExpression, PartialPos>> }> = {
  "body-pink-bow": BOW_CONFIG,
  "body-purple-bow": BOW_CONFIG,
  "body-blue-bow": BOW_CONFIG,
  "body-mint-bow": BOW_CONFIG,
  "body-gold-bow": BOW_CONFIG,
  "body-peach-bow": BOW_CONFIG,
  "body-red-scarf": {
    base: { top: "44%", left: "50%", widthScale: 0.33, rotate: 0 },
    expressions: {
      "standing-happy": { rotate: 5 },
      "standing-celebrating": { top: "48%", left: "43%", rotate: 8 },
      "standing-winking": { top: "47%", left: "47%", rotate: -2 },
    },
  },
  "body-medal-snowflake": {
    base: { top: "43.5%", left: "48.5%", widthScale: 0.22, rotate: 6 },
    expressions: {
      "standing-celebrating": { top: "47%", left: "44.5%", rotate: 8 },
      "standing-winking": { top: "47%", left: "46.5%", rotate: 0 },
    },
  },
};

function resolveBodyPos(itemKey: string, expression: StandingExpression): SlotPos {
  const config = bodySlotConfig[itemKey];
  if (!config) return BODY_DEFAULTS;
  const exprOvr = config.expressions?.[expression] ?? {};
  const base = config.base;
  return {
    top: exprOvr.top ?? base.top ?? BODY_DEFAULTS.top,
    left: exprOvr.left ?? base.left ?? BODY_DEFAULTS.left,
    widthScale: exprOvr.widthScale ?? base.widthScale ?? BODY_DEFAULTS.widthScale,
    rotate: exprOvr.rotate ?? base.rotate ?? BODY_DEFAULTS.rotate,
  };
}

function extractItemKey(path?: string): string {
  return path?.split("/").pop()?.replace(/\.\w+$/, "") ?? "";
}

interface PikuWithOutfitProps {
  expression?: StandingExpression;
  headImage?: string; // e.g. "/outfits/head-crown.webp"
  bodyImage?: string; // e.g. "/outfits/body-red-scarf.webp"
  size?: number; // base Piku size in px, default 100
  cssSize?: string; // CSS value like "clamp(40px, 10vw, 72px)" — overrides size for responsive layouts
}

export default function PikuWithOutfit({
  expression = "standing-happy",
  headImage,
  bodyImage,
  size = 100,
  cssSize,
}: PikuWithOutfitProps) {
  const src = standingExpressionToImage[expression];
  const head = resolveHeadPos(extractItemKey(headImage), expression);
  const body = resolveBodyPos(extractItemKey(bodyImage), expression);

  // When cssSize is provided, use CSS-driven sizing with fill mode.
  // Accessories use percentage-based positioning so they scale with the container.
  const useCssSize = !!cssSize;

  return (
    <div
      style={{
        position: "relative",
        width: useCssSize ? cssSize : size,
        height: useCssSize ? cssSize : size,
      }}
    >
      {/* Base standing Piku */}
      {useCssSize ? (
        <Image
          src={src}
          alt={`Piku the penguin — ${expression}`}
          fill
          sizes={cssSize}
          style={{
            objectFit: "contain",
            pointerEvents: "none",
          }}
          draggable={false}
        />
      ) : (
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
      )}

      {/* Head overlay (e.g. crown, hat) */}
      {headImage && (
        <Image
          src={headImage}
          alt="Piku head accessory"
          width={Math.round(size * head.widthScale)}
          height={Math.round(size * head.widthScale * 0.63)}
          style={{
            position: "absolute",
            zIndex: 2,
            top: head.top,
            left: head.left,
            transform: `translateX(-50%) rotate(${head.rotate}deg)`,
            width: useCssSize ? `${head.widthScale * 100}%` : Math.round(size * head.widthScale),
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
            zIndex: 1,
            top: body.top,
            left: body.left,
            transform: `translateX(-50%) rotate(${body.rotate}deg)`,
            width: useCssSize ? `${body.widthScale * 100}%` : Math.round(size * body.widthScale),
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
