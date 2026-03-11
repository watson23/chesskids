"use client";

import Image from "next/image";

type Expression = "happy" | "thinking" | "celebrating" | "holding-pawn" | "wrong" | "teaching" | "wave" | "wink";

interface PikuProps {
  expression?: Expression;
  size?: number;
}

const expressionToImage: Record<Expression, string> = {
  happy: "/mascot/piku-happy.png",
  thinking: "/mascot/piku-thinking.png",
  celebrating: "/mascot/piku-celebrating.png",
  "holding-pawn": "/mascot/piku-holding-pawn.png",
  wrong: "/mascot/piku-wrong.png",
  teaching: "/mascot/piku-teaching.png",
  wave: "/mascot/piku-wave.png",
  wink: "/mascot/piku-wink.png",
};

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
