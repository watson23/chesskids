"use client";

import Image from "next/image";

interface StarCounterProps {
  totalStars: number;
  animate?: boolean;
}

/**
 * Pre-computed positions for stars in the pile.
 * Each entry is [xOffset, yOffset, rotation, scale] relative to the container center.
 * Arranged to look like a natural scattered pile that grows outward.
 */
const STAR_POSITIONS: [number, number, number, number][] = [
  [0, 0, 0, 1.1],        // 1st star: center, slightly larger
  [-9, -2, -20, 0.85],   // 2nd: left
  [9, -1, 15, 0.9],      // 3rd: right
  [-4, -8, 10, 0.8],     // 4th: top-left
  [5, -7, -12, 0.82],    // 5th: top-right
  [-10, -8, 25, 0.72],   // 6th: far top-left
  [11, -6, -25, 0.75],   // 7th: far right
  [0, -10, 5, 0.7],      // 8th: top center
  [-6, 4, -15, 0.68],    // 9th: bottom-left
  [7, 4, 18, 0.7],       // 10th: bottom-right
];

export default function StarCounter({ totalStars, animate }: StarCounterProps) {
  // Show up to 10 visual stars; beyond that the pile just stays full
  const visibleCount = Math.min(totalStars, STAR_POSITIONS.length);

  if (totalStars === 0) return null;

  return (
    <div
      className={`relative flex items-center justify-center ${
        animate ? "animate-celebrate-pop" : ""
      }`}
      style={{ width: 44, height: 36 }}
    >
      {STAR_POSITIONS.slice(0, visibleCount).map(([x, y, rot, scale], i) => (
        <Image
          key={i}
          src="/icons/icon-star-full.webp"
          alt=""
          width={16}
          height={16}
          className="absolute object-contain drop-shadow-sm"
          style={{
            width: 16 * scale,
            height: "auto",
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            transform: `translate(-50%, -50%) rotate(${rot}deg)`,
            zIndex: i,
          }}
        />
      ))}
      {/* Number overlay */}
      <span
        className="absolute font-extrabold text-[11px] drop-shadow-md"
        style={{
          color: "white",
          zIndex: STAR_POSITIONS.length,
          textShadow: "0 1px 3px rgba(0,0,0,0.5)",
        }}
      >
        {totalStars}
      </span>
    </div>
  );
}
