"use client";

import Image from "next/image";

export type Expression =
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
  | "wave"
  | "standing-celebrating"
  | "standing-happy"
  | "standing-neutral"
  | "standing-teaching"
  | "standing-winking"
  | "standing-sad"
  | "standing-holding-pawn";

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
  "standing-celebrating": "/mascot/piku-standing-celebrating.webp",
  "standing-happy": "/mascot/piku-standing-happy.webp",
  "standing-neutral": "/mascot/piku-standing-neutral.webp",
  "standing-teaching": "/mascot/piku-standing-teaching.webp",
  "standing-winking": "/mascot/piku-standing-winking.webp",
  "standing-sad": "/mascot/piku-standing-sad-1.webp",
  "standing-holding-pawn": "/mascot/piku-standing-holding-chess-piece-1.webp",
};

interface PikuProps {
  expression?: Expression;
  size?: number;
}

export default function Piku({ expression = "happy", size = 80 }: PikuProps) {
  const src = expressionToImage[expression];

  return (
    <div
      style={{ width: size, height: size, position: "relative" }}
      className="flex-shrink-0"
    >
      <Image
        src={src}
        alt={`Piku the penguin — ${expression}`}
        width={size}
        height={size}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center bottom",
        }}
        priority={size >= 100}
        draggable={false}
      />
    </div>
  );
}
