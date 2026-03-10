"use client";

import Image from "next/image";

type Expression = "happy" | "thinking" | "celebrating" | "holding-pawn" | "wrong" | "teaching" | "wave" | "wink";

interface PikkuProps {
  expression?: Expression;
  size?: number;
}

const expressionToImage: Record<Expression, string> = {
  happy: "/mascot/pikku-happy.png",
  thinking: "/mascot/pikku-thinking.png",
  celebrating: "/mascot/pikku-celebrating.png",
  "holding-pawn": "/mascot/pikku-holding-pawn.png",
  wrong: "/mascot/pikku-wrong.png",
  teaching: "/mascot/pikku-teaching.png",
  wave: "/mascot/pikku-wave.png",
  wink: "/mascot/pikku-wink.png",
};

export default function Pikku({ expression = "happy", size = 80 }: PikkuProps) {
  const src = expressionToImage[expression];

  return (
    <Image
      src={src}
      alt={`Pikku the penguin — ${expression}`}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain" }}
      priority={size >= 100}
      draggable={false}
    />
  );
}
