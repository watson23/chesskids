"use client";

import { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import MiniBoardPreview from "@/components/MiniBoardPreview";
import PieceColorPreview from "@/components/PieceColorPreview";
import { BOARD_THEMES, PIECE_COLOR_SETS } from "@/data/themes";

import { useAuth } from "@/hooks/useAuth";
import { useAudio } from "@/hooks/useAudio";
import { updateChildRewards } from "@/lib/firestore";
import PikuWithOutfit from "@/components/PikuWithOutfit";
import { getAvailableBySlot } from "@/data/outfits";
import { updateEquippedOutfit } from "@/lib/firestore";
import { useLocale } from "@/hooks/useLocale";
import type { BoardTheme, PieceColorSet } from "@/types/chess";
import type { LocaleKey } from "@/types/locale";

interface RewardCollectionProps {
  open: boolean;
  onClose: () => void;
}


export default function RewardCollection({ open, onClose }: RewardCollectionProps) {
  const { user, activeChild, refreshChildren } = useAuth();
  const { sfx } = useAudio();
  const [saving, setSaving] = useState(false);

  const unlockedRewards = activeChild?.unlockedRewards ?? [];
  const activeThemeId = activeChild?.activeBoardTheme ?? "classic";
  const activePieceId = activeChild?.activePieceColor ?? "classic";

  const { t } = useLocale();
  const equippedOutfit = activeChild?.equippedOutfit ?? {};
  const [previewOutfit, setPreviewOutfit] = useState<{ head?: string; body?: string }>(equippedOutfit);

  // Sync preview when activeChild changes
  useEffect(() => {
    setPreviewOutfit(activeChild?.equippedOutfit ?? {});
  }, [activeChild?.equippedOutfit]);

  const headOutfits = getAvailableBySlot("head");
  const bodyOutfits = getAvailableBySlot("body");

  const toggleOutfit = useCallback(
    async (slot: "head" | "body", image: string | undefined) => {
      if (!user || !activeChild || saving) return;
      sfx("button-tap");

      const next = { ...previewOutfit };
      if (image && next[slot] === image) {
        delete next[slot];
      } else if (image) {
        next[slot] = image;
      } else {
        delete next[slot];
      }
      setPreviewOutfit(next);

      setSaving(true);
      try {
        await updateEquippedOutfit(user.uid, activeChild.id, next);
        await refreshChildren();
      } catch (err) {
        console.error("Failed to update outfit:", err);
      }
      setSaving(false);
    },
    [user, activeChild, previewOutfit, sfx, saving, refreshChildren]
  );

  const selectTheme = useCallback(
    async (theme: BoardTheme) => {
      if (!user || !activeChild || saving) return;
      if (theme.id === activeThemeId) return;
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
    <div
      className="fixed inset-0 z-50 animate-slide-in flex flex-col"
      style={{ background: "var(--ck-bg) url(/bg-reward-view.webp) center / cover no-repeat" }}
    >
      {/* Semi-transparent overlay for readability */}
      <div className="fixed inset-0 z-0" style={{ background: "rgba(245, 240, 255, 0.5)" }} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 shrink-0">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center card-pillow"
          aria-label="Close"
        >
          <Image src="/icons/icon-close.webp" alt="Close" width={20} height={20} className="object-contain" />
        </button>

        <div className="w-10" />
        <div className="w-10" />
      </div>

      {/* Scrollable middle: boards + pieces (compact, no labels) */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 min-h-0">
        {/* Boards section — no background bubbles, gold ring = selected */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <svg width={18} height={18} viewBox="0 0 16 16" fill="none">
              <rect x="0" y="0" width="7" height="7" rx="1" fill="var(--ck-purple)" opacity="0.9" />
              <rect x="9" y="0" width="7" height="7" rx="1" fill="var(--ck-purple)" opacity="0.4" />
              <rect x="0" y="9" width="7" height="7" rx="1" fill="var(--ck-purple)" opacity="0.4" />
              <rect x="9" y="9" width="7" height="7" rx="1" fill="var(--ck-purple)" opacity="0.9" />
            </svg>
            <span className="text-xs font-extrabold" style={{ color: "var(--ck-text)" }}>Boards</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {BOARD_THEMES.map((theme) => {
              const isActive = theme.id === activeThemeId;

              return (
                <button
                  key={theme.id}
                  onClick={() => selectTheme(theme)}
                  className={`relative rounded-xl overflow-hidden transition-all ${isActive ? "ring-3 ring-amber-400 scale-105" : "opacity-80"}`}
                >
                  <MiniBoardPreview theme={theme} size="sm" />

                  {isActive && (
                    <div className="absolute -top-1 -right-1">
                      <Image src="/icons/icon-check-circle.webp" alt="Active" width={20} height={20} className="object-contain" style={{ width: 20, height: "auto" }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pieces section — wrapping grid, no background bubbles */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="var(--ck-purple)">
              <path d="M12 2a4 4 0 00-4 4c0 1.2.6 2.3 1.4 3C7 10.5 5 13 5 16h14c0-3-2-5.5-4.4-7A4.5 4.5 0 0016 6a4 4 0 00-4-4z" opacity="0.7" />
              <rect x="4" y="18" width="16" height="4" rx="2" />
            </svg>
            <span className="text-xs font-extrabold" style={{ color: "var(--ck-text)" }}>Pieces</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PIECE_COLOR_SETS.map((colorSet) => {
              const isActive = colorSet.id === activePieceId;

              return (
                <button
                  key={colorSet.id}
                  onClick={() => selectPieceColor(colorSet)}
                  className={`relative flex items-center justify-center p-1.5 rounded-xl transition-all ${isActive ? "ring-3 ring-amber-400 scale-105" : "opacity-80"}`}
                >
                  <PieceColorPreview colorSet={colorSet} size={30} />

                  {isActive && (
                    <div className="absolute -top-1 -right-1">
                      <Image src="/icons/icon-check-circle.webp" alt="Active" width={18} height={18} className="object-contain" style={{ width: 18, height: "auto" }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed bottom: outfits + Pikku with chest */}
      <div className="relative z-10 shrink-0 px-4 pb-3 pt-2">
        {/* Outfit selectors */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-extrabold" style={{ color: "var(--ck-text)" }}>
              {t("wardrobe_head")}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => toggleOutfit("head", undefined)}
              className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                border: !previewOutfit.head ? "3px solid var(--ck-gold)" : "3px solid var(--ck-border)",
                background: !previewOutfit.head ? "rgba(252, 211, 77, 0.15)" : "rgba(255,255,255,0.85)",
              }}
            >
              <span className="text-base">✕</span>
            </button>
            {headOutfits.map((item) => {
              const isEquipped = previewOutfit.head === item.image;
              return (
                <button
                  key={item.id}
                  onClick={() => toggleOutfit("head", item.image)}
                  className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    border: isEquipped ? "3px solid var(--ck-gold)" : "3px solid var(--ck-border)",
                    background: isEquipped ? "rgba(252, 211, 77, 0.15)" : "rgba(255,255,255,0.85)",
                  }}
                >
                  <Image
                    src={item.image}
                    alt={t(item.nameKey as LocaleKey)}
                    width={34}
                    height={34}
                    className="object-contain"
                    style={{ width: 34, height: "auto" }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-end gap-3">
          {/* Body outfit selector */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-extrabold" style={{ color: "var(--ck-text)" }}>
                {t("wardrobe_body")}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => toggleOutfit("body", undefined)}
                className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  border: !previewOutfit.body ? "3px solid var(--ck-gold)" : "3px solid var(--ck-border)",
                  background: !previewOutfit.body ? "rgba(252, 211, 77, 0.15)" : "rgba(255,255,255,0.85)",
                }}
              >
                <span className="text-base">✕</span>
              </button>
              {bodyOutfits.map((item) => {
                const isEquipped = previewOutfit.body === item.image;
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleOutfit("body", item.image)}
                    className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
                    style={{
                      border: isEquipped ? "3px solid var(--ck-gold)" : "3px solid var(--ck-border)",
                      background: isEquipped ? "rgba(252, 211, 77, 0.15)" : "rgba(255,255,255,0.85)",
                    }}
                  >
                    <Image
                      src={item.image}
                      alt={t(item.nameKey as LocaleKey)}
                      width={34}
                      height={34}
                      className="object-contain"
                      style={{ width: 34, height: "auto" }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pikku + chest */}
          <div className="flex items-end gap-1 shrink-0">
            <Image
              src="/icons/icon-chest-rewards.webp"
              alt=""
              width={56}
              height={56}
              className="object-contain drop-shadow-lg"
              style={{ width: 56, height: "auto" }}
            />
            <div className="overflow-visible" style={{ marginTop: -30 }}>
              <PikuWithOutfit
                expression="standing-happy"
                headImage={previewOutfit.head}
                bodyImage={previewOutfit.body}
                size={100}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
