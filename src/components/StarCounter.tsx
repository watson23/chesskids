"use client";

import Image from "next/image";
import { UI } from "@/lib/ui";

interface StarCounterProps {
  totalStars: number;
  animate?: boolean;
}

/** Gold star tally pill, the same height as the nav buttons beside it. */
export default function StarCounter({ totalStars, animate }: StarCounterProps) {
  return (
    <div
      className={`nav-pill flex items-center gap-1.5 px-3.5 ${animate ? "animate-celebrate-pop" : ""}`}
      style={{ height: UI.nav.button }}
      aria-label={`${totalStars} stars`}
    >
      <Image src="/icons/icon-star-full.webp" alt="" width={28} height={28} className="object-contain" style={{ width: 28, height: 28 }} />
      <span className="font-extrabold text-xl tabular-nums" style={{ color: "var(--ck-gold-dark)" }}>
        {totalStars}
      </span>
    </div>
  );
}
