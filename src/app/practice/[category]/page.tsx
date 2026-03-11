"use client";

import { use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getPuzzlesByCategory, type PuzzleCategory } from "@/data/puzzles";
import PuzzlePlayer from "@/components/PuzzlePlayer";
import { useAuth } from "@/hooks/useAuth";

const VALID_CATEGORIES: PuzzleCategory[] = [
  "pawn",
  "knight",
  "bishop",
  "rook",
  "queen",
  "king",
  "checkmate",
  "tactics",
];

interface PracticeCategoryPageProps {
  params: Promise<{ category: string }>;
}

export default function PracticeCategoryPage({
  params,
}: PracticeCategoryPageProps) {
  const { category } = use(params);
  const router = useRouter();
  const { user, activeChild } = useAuth();

  const handleComplete = useCallback(() => {
    router.push("/practice");
  }, [router]);

  // Validate category
  if (!VALID_CATEGORIES.includes(category as PuzzleCategory)) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-stone-50 gap-4">
        <h1 className="text-2xl font-bold text-amber-800">
          Category not found
        </h1>
        <button
          onClick={() => router.push("/practice")}
          className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          Go Back
        </button>
      </div>
    );
  }

  const puzzles = getPuzzlesByCategory(category as PuzzleCategory);

  if (puzzles.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-stone-50 gap-4">
        <h1 className="text-2xl font-bold text-amber-800">
          No puzzles available
        </h1>
        <button
          onClick={() => router.push("/practice")}
          className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          Go Back
        </button>
      </div>
    );
  }

  return <PuzzlePlayer puzzles={puzzles} onComplete={handleComplete} uid={user?.uid} childId={activeChild?.id} />;
}
