"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPuzzlesByCategory, type PuzzleCategory } from "@/data/puzzles";
import PuzzlePlayer from "@/components/PuzzlePlayer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { getPuzzleProgress } from "@/lib/firestore";
import type { PuzzleProgress } from "@/types/user";

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
  const { user, activeChild, loading } = useAuth();
  const [fetchedProgress, setFetchedProgress] = useState<Record<string, PuzzleProgress> | null>(null);

  // Fetch puzzle progress
  useEffect(() => {
    if (!user || !activeChild) return;
    getPuzzleProgress(user.uid, activeChild.id).then(setFetchedProgress);
  }, [user, activeChild]);

  // null = still loading — PuzzlePlayer mounts only once progress is known,
  // so it can start at the first unsolved puzzle. Signed-out users get {}.
  const puzzleProgress =
    fetchedProgress ?? (!loading && (!user || !activeChild) ? {} : null);

  const handleComplete = useCallback(() => {
    router.push("/practice");
  }, [router]);

  // Re-fetch progress when a puzzle is solved (called from PuzzlePlayer)
  const handlePuzzleSolved = useCallback(() => {
    if (user && activeChild) {
      getPuzzleProgress(user.uid, activeChild.id).then(setFetchedProgress);
    }
  }, [user, activeChild]);

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

  if (puzzleProgress === null) {
    return <div className="min-h-dvh" style={{ background: "var(--ck-bg)" }} />;
  }

  return (
    <ErrorBoundary>
      <PuzzlePlayer
        puzzles={puzzles}
        onComplete={handleComplete}
        uid={user?.uid}
        childId={activeChild?.id}
        puzzleProgress={puzzleProgress}
        onPuzzleSolved={handlePuzzleSolved}
      />
    </ErrorBoundary>
  );
}
