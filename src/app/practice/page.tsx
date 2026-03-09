"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { House } from "@phosphor-icons/react";
import { getPuzzlesByCategory, type PuzzleCategory } from "@/data/puzzles";
import { useAudio } from "@/hooks/useAudio";

const CATEGORIES: {
  key: PuzzleCategory;
  emoji: string;
}[] = [
  { key: "pawn", emoji: "\u2659" },
  { key: "knight", emoji: "\u2658" },
  { key: "bishop", emoji: "\u2657" },
  { key: "rook", emoji: "\u2656" },
  { key: "queen", emoji: "\u2655" },
  { key: "king", emoji: "\u2654" },
  { key: "checkmate", emoji: "\u2617" },
  { key: "tactics", emoji: "\u2694\uFE0F" },
];

export default function PracticePage() {
  const router = useRouter();
  const { sfx } = useAudio();

  const handleCategoryTap = useCallback(
    (category: PuzzleCategory) => {
      sfx("button-tap");
      router.push(`/practice/${category}`);
    },
    [router, sfx]
  );

  const handleGoHome = useCallback(() => {
    sfx("button-tap");
    router.push("/");
  }, [router, sfx]);

  return (
    <div className="min-h-dvh flex flex-col bg-amber-50">
      {/* Top bar */}
      <div className="flex items-center px-4 py-3">
        <button
          onClick={handleGoHome}
          className="p-2 rounded-full bg-white/80 shadow-sm active:scale-95 transition-transform"
          aria-label="Go home"
        >
          <House size={28} weight="fill" className="text-amber-700" />
        </button>
      </div>

      {/* Category grid */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {CATEGORIES.map(({ key, emoji }) => {
            const puzzleCount = getPuzzlesByCategory(key).length;
            return (
              <button
                key={key}
                onClick={() => handleCategoryTap(key)}
                className="relative flex items-center justify-center aspect-square rounded-3xl bg-white shadow-lg active:scale-95 transition-transform hover:shadow-xl"
                aria-label={`${key} puzzles, ${puzzleCount} puzzles available`}
              >
                <span className="text-6xl leading-none select-none">
                  {emoji}
                </span>

                {/* Puzzle count badge */}
                <span className="absolute top-2 right-2 min-w-[24px] h-6 px-1.5 flex items-center justify-center rounded-full bg-amber-400 text-white text-xs font-bold shadow">
                  {puzzleCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
