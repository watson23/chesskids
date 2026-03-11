"use client";

import Image from "next/image";

type Expression =
  | "happy"
  | "sad"
  | "celebrating"
  | "winking"
  | "surprised"
  | "cheering"
  | "determined"
  | "proud"
  | "sleepy"
  | "puzzled"
  | "teaching"
  | "thinking"
  | "holding-pawn"
  | "wrong"
  | "wave";

const expressionToImage: Record<Expression, string> = {
  happy: "/mascot/piku-happy.webp",
  sad: "/mascot/piku-sad.webp",
  celebrating: "/mascot/piku-celebrating.webp",
  winking: "/mascot/piku-winking.webp",
  surprised: "/mascot/piku-surprised.webp",
  cheering: "/mascot/piku-cheering.webp",
  determined: "/mascot/piku-determined.webp",
  proud: "/mascot/piku-proud.webp",
  sleepy: "/mascot/piku-sleepy.webp",
  puzzled: "/mascot/piku-puzzled.webp",
  teaching: "/mascot/piku-teaching.png", // no webp yet
  thinking: "/mascot/piku-thinking.webp",
  "holding-pawn": "/mascot/piku-holding-pawn.png", // no webp yet
  wrong: "/mascot/piku-wrong.png", // no webp yet
  wave: "/mascot/piku-wave.png", // no webp yet
};

interface PikuProps {
  expression?: Expression;
  size?: number;
}

export default function Piku({ expression = "happy", size = 80 }: PikuProps) {
  const src = expressionToImage[expression];

  return (
    <Image
      src={src}
      alt={`Piku the penguin — ${expression}`}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain" }}
      priority={size >= 100}
      draggable={false}
    />
  );
}
