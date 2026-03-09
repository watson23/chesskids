"use client";

import { Star } from "@phosphor-icons/react";

interface StarDisplayProps {
  stars: number;
  maxStars?: number;
  size?: number;
}

export default function StarDisplay({
  stars,
  maxStars = 3,
  size = 48,
}: StarDisplayProps) {
  return (
    <div className="flex gap-2 items-center justify-center" role="img" aria-label={`${stars} out of ${maxStars} stars`}>
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < stars;
        return (
          <span
            key={i}
            className="animate-celebrate-pop"
            style={{ animationDelay: `${i * 0.2}s`, animationFillMode: "both" }}
          >
            <Star
              size={size}
              weight={filled ? "fill" : "regular"}
              className={filled ? "text-yellow-400" : "text-gray-300"}
            />
          </span>
        );
      })}
    </div>
  );
}
