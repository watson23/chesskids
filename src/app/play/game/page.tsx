"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback } from "react";
import type { AIDifficulty } from "@/types/chess";
import GamePlayer from "@/components/GamePlayer";

function GameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const levelParam = searchParams.get("level");
  const level = (
    levelParam === "1" || levelParam === "2" || levelParam === "3"
      ? Number(levelParam)
      : 1
  ) as AIDifficulty;

  const handleExit = useCallback(() => {
    router.push("/play");
  }, [router]);

  return <GamePlayer difficulty={level} onExit={handleExit} />;
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-stone-50">
          <div className="w-10 h-10 rounded-full border-4 border-amber-300 border-t-amber-600 animate-spin" />
        </div>
      }
    >
      <GameContent />
    </Suspense>
  );
}
