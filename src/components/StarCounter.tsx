"use client";

import Image from "next/image";

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
      <Image src="/icons/icon-star-full.webp" alt="Stars" width={20} height={20} className="object-contain" style={{ width: 20, height: "auto" }} />
      <span className="font-extrabold text-base" style={{ color: "var(--ck-gold-dark)" }}>
        {totalStars}
      </span>
    </div>
  );
}
