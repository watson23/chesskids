"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { House } from "@phosphor-icons/react";
import { useAudio } from "@/hooks/useAudio";

const LEVELS = [
  { level: 1, stars: 1 },
  { level: 2, stars: 2 },
  { level: 3, stars: 3 },
] as const;

export default function PlayPage() {
  const router = useRouter();
  const { sfx } = useAudio();

  const handleSelect = useCallback(
    (level: number) => {
      sfx("button-tap");
      router.push(`/play/game?level=${level}`);
    },
    [sfx, router]
  );

  const handleHome = useCallback(() => {
    sfx("button-tap");
    router.push("/");
  }, [sfx, router]);

  return (
    <div className="min-h-dvh flex flex-col bg-amber-50 pb-14">
      {/* Top bar */}
      <div className="flex items-center px-4 py-3">
        <button
          onClick={handleHome}
          className="p-2 rounded-full bg-white/80 shadow-sm active:scale-95 transition-transform"
          aria-label="Go home"
        >
          <House size={28} weight="fill" className="text-amber-700" />
        </button>
      </div>

      {/* Difficulty cards */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {LEVELS.map(({ level, stars }) => (
          <button
            key={level}
            onClick={() => handleSelect(level)}
            className="w-full max-w-xs py-8 bg-white rounded-3xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-1 animate-slide-in"
            style={{ animationDelay: `${(level - 1) * 0.1}s` }}
            aria-label={`Level ${level}, ${stars} star${stars > 1 ? "s" : ""}`}
          >
            {Array.from({ length: stars }, (_, i) => (
              <span key={i} className="text-4xl" role="img" aria-hidden="true">
                &#11088;
              </span>
            ))}
          </button>
        ))}
      </div>
    </div>
  );
}
