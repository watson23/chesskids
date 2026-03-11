"use client";

import Image from "next/image";

interface StarDisplayProps {
  stars: number;
  maxStars?: number;
  size?: number;
  /** Delay in ms between each star's pop animation (default 200) */
  staggerDelay?: number;
}

export default function StarDisplay({
  stars,
  maxStars = 3,
  size = 48,
  staggerDelay = 200,
}: StarDisplayProps) {
  return (
    <div className="flex gap-2 items-center justify-center" role="img" aria-label={`${stars} out of ${maxStars} stars`}>
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < stars;
        return (
          <span
            key={i}
            className="animate-celebrate-pop"
            style={{ animationDelay: `${i * (staggerDelay / 1000)}s`, animationFillMode: "both" }}
          >
            <Image
              src={filled ? "/icons/icon-star-full.webp" : "/icons/icon-star-empty.webp"}
              alt={filled ? "Star earned" : "Star empty"}
              width={size}
              height={size}
              className="object-contain"
              style={{ width: size, height: "auto" }}
            />
          </span>
        );
      })}
    </div>
  );
}
