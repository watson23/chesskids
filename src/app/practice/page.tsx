"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { getPuzzlesByCategory, PUZZLES, type PuzzleCategory } from "@/data/puzzles";
import { useAudio } from "@/hooks/useAudio";
import { useLocale } from "@/hooks/useLocale";
import { useAuth } from "@/hooks/useAuth";
import { getPuzzleProgress } from "@/lib/firestore";
import type { PuzzleProgress } from "@/types/user";
import { PawnSVG, KnightSVG, BishopSVG, RookSVG, QueenSVG, KingSVG } from "@/lib/pieces";

import SpeechBubble from "@/components/SpeechBubble";
import NavIcon from "@/components/NavIcon";
import type { LocaleKey } from "@/types/locale";

const STAGGER_CLASSES = [
  "animate-fade-in-up",
  "animate-fade-in-up-d1",
  "animate-fade-in-up-d2",
  "animate-fade-in-up-d3",
  "animate-fade-in-up-d4",
  "animate-fade-in-up-d5",
  "animate-fade-in-up-d6",
  "animate-fade-in-up-d7",
];

const CATEGORIES: {
  key: PuzzleCategory;
  labelKey: LocaleKey;
  color: string;
  colorDark: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "pawn",
    labelKey: "category_pawn",
    color: "#6EE7B7",
    colorDark: "#34D399",
    icon: <PawnSVG fill="#fff" stroke="rgba(0,0,0,0.15)" size={40} />,
  },
  {
    key: "knight",
    labelKey: "category_knight",
    color: "#B197FC",
    colorDark: "#9775E6",
    icon: <KnightSVG fill="#fff" stroke="rgba(0,0,0,0.15)" size={40} />,
  },
  {
    key: "bishop",
    labelKey: "category_bishop",
    color: "#93C5FD",
    colorDark: "#60A5FA",
    icon: <BishopSVG fill="#fff" stroke="rgba(0,0,0,0.15)" size={40} />,
  },
  {
    key: "rook",
    labelKey: "category_rook",
    color: "#FCD34D",
    colorDark: "#F59E0B",
    icon: <RookSVG fill="#fff" stroke="rgba(0,0,0,0.15)" size={40} />,
  },
  {
    key: "queen",
    labelKey: "category_queen",
    color: "#FDA4AF",
    colorDark: "#F472B6",
    icon: <QueenSVG fill="#fff" stroke="rgba(0,0,0,0.15)" size={40} />,
  },
  {
    key: "king",
    labelKey: "category_king",
    color: "#FDBA74",
    colorDark: "#FB923C",
    icon: <KingSVG fill="#fff" stroke="rgba(0,0,0,0.15)" size={40} />,
  },
  {
    key: "checkmate",
    labelKey: "category_checkmate",
    color: "#F87171",
    colorDark: "#EF4444",
    icon: (
      <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
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
      <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
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
  const { sfx, say } = useAudio();
  const { t } = useLocale();
  const { user, activeChild } = useAuth();
  const [puzzleProgress, setPuzzleProgress] = useState<Record<string, PuzzleProgress>>({});

  // Fetch puzzle progress from Firestore
  useEffect(() => {
    if (!user || !activeChild) return;
    getPuzzleProgress(user.uid, activeChild.id).then(setPuzzleProgress);
  }, [user, activeChild]);

  // Speak the instruction when page loads
  useEffect(() => {
    say("practice_piku_speech");
  }, [say]);

  const handleCategoryTap = useCallback(
    (category: PuzzleCategory) => {
      sfx("button-tap");
      router.push(`/practice/${category}`);
    },
    [router, sfx]
  );

  return (
    <div
      className="min-h-dvh flex flex-col pb-24 overflow-y-auto"
      style={{
        background: "var(--ck-bg) url(/practice-bg.webp) center top / cover no-repeat fixed",
      }}
    >
      {/* Semi-transparent overlay for readability */}
      <div
        className="min-h-dvh flex flex-col"
        style={{ background: "rgba(245, 240, 255, 0.6)" }}
      >
        {/* Piku header with home button */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-2 animate-fade-in-up">
          <NavIcon icon="icon-home" alt="Back to map" onClick={() => router.push("/")} />
          <Image
            src="/mascot/piku-determined.webp"
            alt="Piku"
            width={72}
            height={86}
            className="flex-shrink-0 drop-shadow-md"
          />
          <SpeechBubble text={t("practice_piku_speech")} visible />
        </div>

        {/* Total teal star counter */}
        {(() => {
          const totalSolved = PUZZLES.filter(p => puzzleProgress[p.id]?.solved).length;
          const totalCount = PUZZLES.length;
          return (
            <div className="flex items-center justify-center gap-2 px-4 pb-2 animate-fade-in-up">
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"
                  fill="#2DD4BF"
                  stroke="#14B8A6"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-extrabold" style={{ color: "#14B8A6" }}>
                {totalSolved} / {totalCount}
              </span>
            </div>
          );
        })()}

        {/* Category grid */}
        <div className="flex-1 px-4 py-4 flex justify-center">
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm content-start">
            {CATEGORIES.map(({ key, labelKey, color, colorDark, icon }, index) => {
              const puzzles = getPuzzlesByCategory(key);
              const puzzleCount = puzzles.length;
              const solvedCount = puzzles.filter(p => puzzleProgress[p.id]?.solved).length;
              const label = t(labelKey);
              return (
                <button
                  key={key}
                  onClick={() => handleCategoryTap(key)}
                  className={`card-pillow flex flex-col items-center overflow-hidden transition-transform ${STAGGER_CLASSES[index] || "animate-fade-in-up"}`}
                  style={{ transform: "translateY(0)" }}
                  onPointerDown={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(3px) scale(0.97)";
                  }}
                  onPointerUp={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                  onPointerLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                  aria-label={`${label} puzzles, ${puzzleCount} puzzles available`}
                >
                  {/* Colored top banner with icon */}
                  <div
                    className="w-full flex items-center justify-center py-4"
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${colorDark})`,
                    }}
                  >
                    <span className="select-none drop-shadow-md">{icon}</span>
                  </div>

                  {/* White bottom with label and count */}
                  <div className="w-full px-3 py-3 flex flex-col items-center gap-1.5">
                    <span
                      className="text-[15px] font-extrabold"
                      style={{ color: "var(--ck-text)" }}
                    >
                      {label}
                    </span>

                    {/* Progress bar placeholder */}
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--ck-border)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${puzzleCount > 0 ? (solvedCount / puzzleCount) * 100 : 0}%`,
                          background: `linear-gradient(90deg, ${color}, ${colorDark})`,
                        }}
                      />
                    </div>

                    <span
                      className="text-[11px] font-bold"
                      style={{ color: "var(--ck-text-light)" }}
                    >
                      {solvedCount} / {puzzleCount} {t("practice_solved")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
