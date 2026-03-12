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
    <div className="fixed inset-0 z-50 animate-slide-in" style={{ background: "var(--ck-bg)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center card-pillow"
          aria-label="Close"
        >
          <Image src="/icons/icon-close.webp" alt="Close" width={20} height={20} className="object-contain" />
        </button>

        <div className="w-10" /> {/* Spacer for centering (was trophy icon) */}

        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto px-4 pb-8" style={{ height: "calc(100dvh - 60px)" }}>
        {/* Outfits section */}
        <div className="mb-8">
          {/* Piku preview — pt-10 reserves space for head accessories like crown/hat */}
          <div className="flex justify-center mb-4 pt-10 overflow-visible">
            <PikuWithOutfit
              expression="standing-happy"
              headImage={previewOutfit.head}
              bodyImage={previewOutfit.body}
              size={160}
            />
          </div>

          {/* Head outfits */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-extrabold" style={{ color: "var(--ck-text)" }}>
                {t("wardrobe_head")}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {/* None button */}
              <button
                onClick={() => toggleOutfit("head", undefined)}
                className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                style={{
                  border: !previewOutfit.head ? "3px solid var(--ck-gold)" : "3px solid var(--ck-border)",
                  background: !previewOutfit.head ? "rgba(252, 211, 77, 0.15)" : "white",
                }}
              >
                <span className="text-lg">✕</span>
              </button>
              {headOutfits.map((item) => {
                const isEquipped = previewOutfit.head === item.image;
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleOutfit("head", item.image)}
                    className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center relative overflow-hidden"
                    style={{
                      border: isEquipped ? "3px solid var(--ck-gold)" : "3px solid var(--ck-border)",
                      background: isEquipped ? "rgba(252, 211, 77, 0.15)" : "white",
                    }}
                  >
                    <Image
                      src={item.image}
                      alt={t(item.nameKey as LocaleKey)}
                      width={40}
                      height={40}
                      className="object-contain"
                      style={{ width: 40, height: "auto" }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body outfits */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-extrabold" style={{ color: "var(--ck-text)" }}>
                {t("wardrobe_body")}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {/* None button */}
              <button
                onClick={() => toggleOutfit("body", undefined)}
                className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                style={{
                  border: !previewOutfit.body ? "3px solid var(--ck-gold)" : "3px solid var(--ck-border)",
                  background: !previewOutfit.body ? "rgba(252, 211, 77, 0.15)" : "white",
                }}
              >
                <span className="text-lg">✕</span>
              </button>
              {bodyOutfits.map((item) => {
                const isEquipped = previewOutfit.body === item.image;
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleOutfit("body", item.image)}
                    className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center relative overflow-hidden"
                    style={{
                      border: isEquipped ? "3px solid var(--ck-gold)" : "3px solid var(--ck-border)",
                      background: isEquipped ? "rgba(252, 211, 77, 0.15)" : "white",
                    }}
                  >
                    <Image
                      src={item.image}
                      alt={t(item.nameKey as LocaleKey)}
                      width={40}
                      height={40}
                      className="object-contain"
                      style={{ width: 40, height: "auto" }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

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
              const isActive = theme.id === activeThemeId;

              return (
                <button
                  key={theme.id}
                  onClick={() => selectTheme(theme)}
                  className="relative flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all"
                  style={{
                    background: isActive ? "rgba(252, 211, 77, 0.15)" : "white",
                    border: isActive ? "3px solid var(--ck-gold)" : "3px solid var(--ck-border)",
                  }}
                >
                  <MiniBoardPreview theme={theme} size="sm" />

                  {/* Active checkmark */}
                  {isActive && (
                    <div className="absolute -top-1.5 -right-1.5">
                      <Image src="/icons/icon-check-circle.webp" alt="Active" width={24} height={24} className="object-contain" style={{ width: 24, height: "auto" }} />
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
              const isActive = colorSet.id === activePieceId;

              return (
                <button
                  key={colorSet.id}
                  onClick={() => selectPieceColor(colorSet)}
                  className="relative flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all"
                  style={{
                    background: isActive ? "rgba(252, 211, 77, 0.15)" : "white",
                    border: isActive ? "3px solid var(--ck-gold)" : "3px solid var(--ck-border)",
                  }}
                >
                  <PieceColorPreview colorSet={colorSet} size={36} />

                  {/* Active checkmark */}
                  {isActive && (
                    <div className="absolute -top-1.5 -right-1.5">
                      <Image src="/icons/icon-check-circle.webp" alt="Active" width={24} height={24} className="object-contain" style={{ width: 24, height: "auto" }} />
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
