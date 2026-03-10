"use client";

import { useCallback, useState } from "react";
import { X, Lock, CheckCircle } from "@phosphor-icons/react";
import MiniBoardPreview from "@/components/MiniBoardPreview";
import PieceColorPreview from "@/components/PieceColorPreview";
import { BOARD_THEMES, PIECE_COLOR_SETS } from "@/data/themes";
import { CHESTS } from "@/data/chests";
import { useAuth } from "@/hooks/useAuth";
import { useAudio } from "@/hooks/useAudio";
import { updateChildRewards } from "@/lib/firestore";
import type { BoardTheme, PieceColorSet } from "@/types/chess";

interface RewardCollectionProps {
  open: boolean;
  onClose: () => void;
}

/** Find which chest contains a specific theme or piece color */
function getChestForReward(
  type: "board-theme" | "piece-color",
  id: string
): { starsRequired: number } | null {
  for (const chest of CHESTS) {
    for (const reward of chest.rewards) {
      if (type === "board-theme" && reward.themeId === id) return chest;
      if (type === "piece-color" && reward.pieceColorId === id) return chest;
    }
  }
  return null;
}

/** Check if a reward ID matching this theme/pieces exists in unlocked rewards */
function isRewardUnlocked(
  type: "board-theme" | "piece-color",
  id: string,
  unlockedRewards: string[]
): boolean {
  if (id === "classic") return true; // classic always unlocked
  for (const chest of CHESTS) {
    for (const reward of chest.rewards) {
      if (type === "board-theme" && reward.themeId === id && unlockedRewards.includes(reward.id)) return true;
      if (type === "piece-color" && reward.pieceColorId === id && unlockedRewards.includes(reward.id)) return true;
    }
  }
  return false;
}

export default function RewardCollection({ open, onClose }: RewardCollectionProps) {
  const { user, activeChild, refreshChildren } = useAuth();
  const { sfx } = useAudio();
  const [saving, setSaving] = useState(false);

  const unlockedRewards = activeChild?.unlockedRewards ?? [];
  const activeThemeId = activeChild?.activeBoardTheme ?? "classic";
  const activePieceId = activeChild?.activePieceColor ?? "classic";

  const selectTheme = useCallback(
    async (theme: BoardTheme) => {
      if (!user || !activeChild || saving) return;
      if (theme.id === activeThemeId) return;
      if (!isRewardUnlocked("board-theme", theme.id, unlockedRewards)) return;

      sfx("button-tap");
      setSaving(true);
      try {
        await updateChildRewards(
          user.uid,
          activeChild.id,
          unlockedRewards,
          theme.id,
          undefined
        );
        await refreshChildren();
      } catch (err) {
        console.error("Failed to update theme:", err);
      }
      setSaving(false);
    },
    [user, activeChild, activeThemeId, unlockedRewards, sfx, saving, refreshChildren]
  );

  const selectPieceColor = useCallback(
    async (colorSet: PieceColorSet) => {
      if (!user || !activeChild || saving) return;
      if (colorSet.id === activePieceId) return;
      if (!isRewardUnlocked("piece-color", colorSet.id, unlockedRewards)) return;

      sfx("button-tap");
      setSaving(true);
      try {
        await updateChildRewards(
          user.uid,
          activeChild.id,
          unlockedRewards,
          undefined,
          colorSet.id
        );
        await refreshChildren();
      } catch (err) {
        console.error("Failed to update piece color:", err);
      }
      setSaving(false);
    },
    [user, activeChild, activePieceId, unlockedRewards, sfx, saving, refreshChildren]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 animate-slide-in" style={{ background: "var(--ck-bg)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center card-pillow"
          aria-label="Close"
        >
          <X size={22} weight="bold" style={{ color: "var(--ck-text-light)" }} />
        </button>

        {/* Trophy icon */}
        <div className="flex items-center gap-2">
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <path
              d="M7 4h10v2a5 5 0 01-10 0V4z"
              fill="var(--ck-gold)"
              stroke="var(--ck-gold-dark)"
              strokeWidth="1.5"
            />
            <path d="M4 4h3v3a3 3 0 01-3-3z" fill="var(--ck-gold)" stroke="var(--ck-gold-dark)" strokeWidth="1.5" />
            <path d="M17 4h3a3 3 0 01-3 3V4z" fill="var(--ck-gold)" stroke="var(--ck-gold-dark)" strokeWidth="1.5" />
            <rect x="10" y="13" width="4" height="4" rx="1" fill="var(--ck-gold)" />
            <rect x="8" y="17" width="8" height="3" rx="1.5" fill="var(--ck-gold-dark)" />
          </svg>
        </div>

        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto px-4 pb-8" style={{ height: "calc(100dvh - 60px)" }}>
        {/* Boards section */}
        <div className="mb-6">
          {/* Visual section header — mini board icon */}
          <div className="flex items-center gap-2 mb-3">
            <svg width={20} height={20} viewBox="0 0 16 16" fill="none">
              <rect x="0" y="0" width="7" height="7" rx="1" fill="var(--ck-purple)" opacity="0.9" />
              <rect x="9" y="0" width="7" height="7" rx="1" fill="var(--ck-purple)" opacity="0.4" />
              <rect x="0" y="9" width="7" height="7" rx="1" fill="var(--ck-purple)" opacity="0.4" />
              <rect x="9" y="9" width="7" height="7" rx="1" fill="var(--ck-purple)" opacity="0.9" />
            </svg>
            <span className="text-sm font-extrabold" style={{ color: "var(--ck-text)" }}>Boards</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {BOARD_THEMES.map((theme) => {
              const unlocked = isRewardUnlocked("board-theme", theme.id, unlockedRewards);
              const isActive = theme.id === activeThemeId;
              const chest = getChestForReward("board-theme", theme.id);

              return (
                <button
                  key={theme.id}
                  onClick={() => unlocked && selectTheme(theme)}
                  disabled={!unlocked}
                  className="relative flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all"
                  style={{
                    background: isActive ? "rgba(252, 211, 77, 0.15)" : "white",
                    border: isActive ? "3px solid var(--ck-gold)" : "3px solid var(--ck-border)",
                    opacity: unlocked ? 1 : 0.5,
                    filter: unlocked ? "none" : "grayscale(0.8)",
                  }}
                >
                  <MiniBoardPreview theme={theme} size="sm" />

                  {/* Active checkmark */}
                  {isActive && (
                    <div className="absolute -top-1.5 -right-1.5">
                      <CheckCircle size={24} weight="fill" color="var(--ck-mint-dark)" />
                    </div>
                  )}

                  {/* Lock overlay for locked items */}
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/10">
                      <div className="flex flex-col items-center">
                        <Lock size={20} weight="bold" color="var(--ck-text-light)" />
                        {chest && (
                          <span className="text-[10px] font-bold mt-0.5" style={{ color: "var(--ck-text-light)" }}>
                            {chest.starsRequired}&#11088;
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <span className="text-[11px] font-bold" style={{ color: "var(--ck-text-light)" }}>
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pieces section */}
        <div>
          {/* Visual section header — piece icon */}
          <div className="flex items-center gap-2 mb-3">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="var(--ck-purple)">
              <path d="M12 2a4 4 0 00-4 4c0 1.2.6 2.3 1.4 3C7 10.5 5 13 5 16h14c0-3-2-5.5-4.4-7A4.5 4.5 0 0016 6a4 4 0 00-4-4z" opacity="0.7" />
              <rect x="4" y="18" width="16" height="4" rx="2" />
            </svg>
            <span className="text-sm font-extrabold" style={{ color: "var(--ck-text)" }}>Pieces</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PIECE_COLOR_SETS.map((colorSet) => {
              const unlocked = isRewardUnlocked("piece-color", colorSet.id, unlockedRewards);
              const isActive = colorSet.id === activePieceId;
              const chest = getChestForReward("piece-color", colorSet.id);

              return (
                <button
                  key={colorSet.id}
                  onClick={() => unlocked && selectPieceColor(colorSet)}
                  disabled={!unlocked}
                  className="relative flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all"
                  style={{
                    background: isActive ? "rgba(252, 211, 77, 0.15)" : "white",
                    border: isActive ? "3px solid var(--ck-gold)" : "3px solid var(--ck-border)",
                    opacity: unlocked ? 1 : 0.5,
                    filter: unlocked ? "none" : "grayscale(0.8)",
                  }}
                >
                  <PieceColorPreview colorSet={colorSet} size={36} />

                  {/* Active checkmark */}
                  {isActive && (
                    <div className="absolute -top-1.5 -right-1.5">
                      <CheckCircle size={24} weight="fill" color="var(--ck-mint-dark)" />
                    </div>
                  )}

                  {/* Lock overlay */}
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/10">
                      <div className="flex flex-col items-center">
                        <Lock size={20} weight="bold" color="var(--ck-text-light)" />
                        {chest && (
                          <span className="text-[10px] font-bold mt-0.5" style={{ color: "var(--ck-text-light)" }}>
                            {chest.starsRequired}&#11088;
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <span className="text-[11px] font-bold" style={{ color: "var(--ck-text-light)" }}>
                    {colorSet.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
