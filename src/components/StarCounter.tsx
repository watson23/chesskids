"use client";

import { Star } from "@phosphor-icons/react";

interface StarCounterProps {
  totalStars: number;
  animate?: boolean;
}

export default function StarCounter({ totalStars, animate }: StarCounterProps) {
  return (
    <div
      className={`flex items-center gap-1.5 bg-white/70 backdrop-blur rounded-full px-3 py-1.5 shadow-sm ${
        animate ? "animate-celebrate-pop" : ""
      }`}
    >
      <Star size={20} weight="fill" color="var(--ck-gold)" />
      <span className="font-extrabold text-base" style={{ color: "var(--ck-gold-dark)" }}>
        {totalStars}
      </span>
    </div>
  );
}
