"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { getPuzzlesByCategory, type PuzzleCategory } from "@/data/puzzles";
import { useAudio } from "@/hooks/useAudio";
import { useLocale } from "@/hooks/useLocale";
import { PawnSVG, KnightSVG, BishopSVG, RookSVG, QueenSVG, KingSVG } from "@/lib/pieces";

const CATEGORIES: {
  key: PuzzleCategory;
  labelKey: string;
  color: string;
  colorDark: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "pawn",
    labelKey: "category_pawn",
    color: "#6EE7B7",
    colorDark: "#34D399",
    icon: <PawnSVG fill="#fff" stroke="rgba(0,0,0,0.15)" size={48} />,
  },
  {
    key: "knight",
    labelKey: "category_knight",
    color: "#B197FC",
    colorDark: "#9775E6",
    icon: <KnightSVG fill="#fff" stroke="rgba(0,0,0,0.15)" size={48} />,
  },
  {
    key: "bishop",
    labelKey: "category_bishop",
    color: "#93C5FD",
    colorDark: "#60A5FA",
    icon: <BishopSVG fill="#fff" stroke="rgba(0,0,0,0.15)" size={48} />,
  },
  {
    key: "rook",
    labelKey: "category_rook",
    color: "#FCD34D",
    colorDark: "#F59E0B",
    icon: <RookSVG fill="#fff" stroke="rgba(0,0,0,0.15)" size={48} />,
  },
  {
    key: "queen",
    labelKey: "category_queen",
    color: "#FDA4AF",
    colorDark: "#F472B6",
    icon: <QueenSVG fill="#fff" stroke="rgba(0,0,0,0.15)" size={48} />,
  },
  {
    key: "king",
    labelKey: "category_king",
    color: "#FDBA74",
    colorDark: "#FB923C",
    icon: <KingSVG fill="#fff" stroke="rgba(0,0,0,0.15)" size={48} />,
  },
  {
    key: "checkmate",
    labelKey: "category_checkmate",
    color: "#F87171",
    colorDark: "#EF4444",
    icon: (
      <svg width="48" height="48" viewBox="0 0 44 44" fill="none">
        <path d="M22 6 L24 15 L33 15 L26 21 L29 30 L22 25 L15 30 L18 21 L11 15 L20 15 Z" fill="white" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "tactics",
    labelKey: "category_tactics",
    color: "#5EEAD4",
    colorDark: "#2DD4BF",
    icon: (
      <svg width="48" height="48" viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="12" stroke="white" strokeWidth="2.5" />
        <circle cx="22" cy="22" r="6" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="22" cy="22" r="2.5" fill="white" />
        <line x1="22" y1="6" x2="22" y2="12" stroke="white" strokeWidth="2" />
        <line x1="22" y1="32" x2="22" y2="38" stroke="white" strokeWidth="2" />
        <line x1="6" y1="22" x2="12" y2="22" stroke="white" strokeWidth="2" />
        <line x1="32" y1="22" x2="38" y2="22" stroke="white" strokeWidth="2" />
      </svg>
    ),
  },
];

export default function PracticePage() {
  const router = useRouter();
  const { sfx } = useAudio();
  const { t } = useLocale();

  const handleCategoryTap = useCallback(
    (category: PuzzleCategory) => {
      sfx("button-tap");
      router.push(`/practice/${category}`);
    },
    [router, sfx]
  );

  return (
    <div className="min-h-dvh flex flex-col pb-20 overflow-y-auto" style={{ background: "var(--ck-bg)" }}>
      {/* Category grid */}
      <div className="flex-1 px-5 py-6 flex justify-center">
        <div className="grid grid-cols-2 gap-5 w-full max-w-sm content-start">
          {CATEGORIES.map(({ key, labelKey, color, colorDark, icon }) => {
            const puzzleCount = getPuzzlesByCategory(key).length;
            const label = t(labelKey);
            return (
              <button
                key={key}
                onClick={() => handleCategoryTap(key)}
                className="relative flex flex-col items-center justify-center aspect-square rounded-[24px] transition-transform"
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
                aria-label={`${label} puzzles, ${puzzleCount} puzzles available`}
              >
                <span className="select-none">{icon}</span>
                <span className="text-[15px] font-extrabold text-white/95 mt-1.5">{label}</span>

                {/* Puzzle count badge */}
                <span
                  className="absolute top-3 right-3 min-w-[28px] h-[28px] px-1.5 flex items-center justify-center rounded-full text-[12px] font-extrabold"
                  style={{ background: "rgba(255,255,255,0.3)", color: "white" }}
                >
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
