"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Star } from "@phosphor-icons/react";
import { useAudio } from "@/hooks/useAudio";
import { useLocale } from "@/hooks/useLocale";

const DIFFICULTIES = [
  {
    level: 1,
    labelKey: "difficulty_easy",
    stars: 1,
    color: "#6EE7B7",
    colorDark: "#34D399",
    descriptionKey: "difficulty_easy_desc",
  },
  {
    level: 2,
    labelKey: "difficulty_medium",
    stars: 2,
    color: "#FCD34D",
    colorDark: "#F59E0B",
    descriptionKey: "difficulty_medium_desc",
  },
  {
    level: 3,
    labelKey: "difficulty_hard",
    stars: 3,
    color: "#FDA4AF",
    colorDark: "#F472B6",
    descriptionKey: "difficulty_hard_desc",
  },
];

export default function PlayPage() {
  const router = useRouter();
  const { sfx } = useAudio();
  const { t } = useLocale();

  const handleDifficultyTap = useCallback(
    (level: number) => {
      sfx("button-tap");
      router.push(`/play/game?difficulty=${level}`);
    },
    [router, sfx]
  );

  return (
    <div className="min-h-dvh flex flex-col pb-20" style={{ background: "var(--ck-bg)" }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        {DIFFICULTIES.map(({ level, labelKey, stars, color, colorDark, descriptionKey }) => (
          <button
            key={level}
            onClick={() => handleDifficultyTap(level)}
            className="w-full max-w-sm rounded-[24px] px-8 py-6 flex flex-col items-center gap-2 transition-transform"
            style={{
              background: color,
              boxShadow: `0 6px 0 ${colorDark}, 0 8px 16px rgba(0,0,0,0.1)`,
              transform: "translateY(0)",
            }}
            onPointerDown={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(6px)";
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 ${colorDark}, 0 2px 4px rgba(0,0,0,0.06)`;
            }}
            onPointerUp={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 0 ${colorDark}, 0 8px 16px rgba(0,0,0,0.1)`;
            }}
            onPointerLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 0 ${colorDark}, 0 8px 16px rgba(0,0,0,0.1)`;
            }}
            aria-label={`${t(labelKey)} difficulty, level ${level}`}
          >
            <div className="flex gap-1">
              {Array.from({ length: stars }, (_, i) => (
                <Star key={i} size={36} weight="fill" color="white" />
              ))}
            </div>
            <span className="text-xl font-extrabold text-white">{t(labelKey)}</span>
            <span className="text-sm font-semibold text-white/70">{t(descriptionKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
