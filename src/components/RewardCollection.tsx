"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import MiniBoardPreview from "@/components/MiniBoardPreview";
import NavIcon from "@/components/NavIcon";
import TopBar from "@/components/TopBar";
import PikuWithOutfit from "@/components/PikuWithOutfit";
import { BOARD_THEMES } from "@/data/themes";
import { useAuth } from "@/hooks/useAuth";
import { useAudio } from "@/hooks/useAudio";
import { updateChildRewards, updateEquippedOutfit } from "@/lib/firestore";
import { getAvailableBySlot, isChestReward } from "@/data/outfits";
import { useLocale } from "@/hooks/useLocale";
import { UI } from "@/lib/ui";
import type { BoardTheme } from "@/types/chess";
import type { LocaleKey } from "@/types/locale";

interface RewardCollectionProps {
  open: boolean;
  onClose: () => void;
}

/** Illustrated section icons; the inline glyphs below are the fallback. */
const SECTION_ICONS: Partial<Record<"hat" | "bow" | "board", string>> = {
  hat: "/icons/icon-section-hat.webp",
  bow: "/icons/icon-section-bow.webp",
  board: "/icons/icon-section-board.webp",
};

function HatGlyph() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="16" width="18" height="4" rx="2" fill="var(--ck-purple)" />
      <path d="M7 16 L7 7 Q7 4 12 4 Q17 4 17 7 L17 16 Z" fill="var(--ck-purple)" />
      <rect x="7" y="11" width="10" height="3" fill="var(--ck-pink)" />
    </svg>
  );
}

function BowGlyph() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12 L3 6 Q2 12 3 18 Z" fill="var(--ck-pink)" />
      <path d="M12 12 L21 6 Q22 12 21 18 Z" fill="var(--ck-pink)" />
      <circle cx="12" cy="12" r="3" fill="var(--ck-pink-dark)" />
    </svg>
  );
}

function BoardGlyph() {
  return (
    <svg width={22} height={22} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="0" y="0" width="7" height="7" rx="1.5" fill="var(--ck-purple)" opacity="0.9" />
      <rect x="9" y="0" width="7" height="7" rx="1.5" fill="var(--ck-purple)" opacity="0.4" />
      <rect x="0" y="9" width="7" height="7" rx="1.5" fill="var(--ck-purple)" opacity="0.4" />
      <rect x="9" y="9" width="7" height="7" rx="1.5" fill="var(--ck-purple)" opacity="0.9" />
    </svg>
  );
}

function SectionHeading({ icon, label }: { icon: "hat" | "bow" | "board"; label: string }) {
  const img = SECTION_ICONS[icon];
  return (
    <div className="flex items-center gap-2 mb-2 px-1">
      {img ? (
        <Image src={img} alt="" width={30} height={30} className="object-contain" style={{ width: 30, height: 30 }} />
      ) : icon === "hat" ? <HatGlyph /> : icon === "bow" ? <BowGlyph /> : <BoardGlyph />}
      <span className="text-[15px] font-extrabold" style={{ color: "var(--ck-text)" }}>{label}</span>
    </div>
  );
}

/** One selectable square: outfit item, "nothing", or board theme. */
function Tile({
  selected,
  onClick,
  label,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="relative shrink-0 rounded-2xl flex items-center justify-center transition-transform active:scale-90"
      style={{
        width: UI.tile.size,
        height: UI.tile.size,
        border: `3px solid ${selected ? "var(--ck-gold)" : "rgba(255,255,255,0.9)"}`,
        background: selected ? "rgba(252, 211, 77, 0.22)" : "rgba(255,255,255,0.82)",
        boxShadow: selected ? "0 0 0 3px rgba(252, 211, 77, 0.35), 0 4px 10px rgba(61,51,96,0.12)" : "0 3px 8px rgba(61,51,96,0.1)",
      }}
      aria-label={label}
      aria-pressed={selected}
    >
      {children}
      {selected && (
        <Image
          src="/icons/icon-check-circle.webp"
          alt=""
          width={22}
          height={22}
          className="absolute -top-2 -right-2 object-contain"
          style={{ width: 22, height: 22 }}
        />
      )}
    </button>
  );
}

function NothingGlyph() {
  return (
    <svg width={26} height={26} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="var(--ck-text-light)" strokeWidth="2.5" strokeDasharray="4 3" />
    </svg>
  );
}

export default function RewardCollection({ open, onClose }: RewardCollectionProps) {
  const { user, activeChild, refreshChildren } = useAuth();
  const { sfx } = useAudio();
  const { t } = useLocale();
  const [saving, setSaving] = useState(false);

  const unlockedRewards = useMemo(() => activeChild?.unlockedRewards ?? [], [activeChild?.unlockedRewards]);
  const activeThemeId = activeChild?.activeBoardTheme ?? "classic";

  const equipped = activeChild?.equippedOutfit;
  const [previewOutfit, setPreviewOutfit] = useState<{ head?: string; body?: string }>(equipped ?? {});

  // Re-seed the preview when the saved outfit changes (child switch, chest
  // reward) — adjusted during render instead of in an effect.
  const [seenEquipped, setSeenEquipped] = useState(equipped);
  if (equipped !== seenEquipped) {
    setSeenEquipped(equipped);
    setPreviewOutfit(equipped ?? {});
  }

  // Only show outfits unlocked from chests (or free items not gated by any chest)
  const unlockedOutfitIds = new Set(
    unlockedRewards.filter((r) => r.startsWith("outfit-")).map((r) => r.replace("outfit-", ""))
  );
  const headOutfits = getAvailableBySlot("head").filter(
    (item) => unlockedOutfitIds.has(item.id) || !isChestReward(item.id)
  );
  const bodyOutfits = getAvailableBySlot("body").filter(
    (item) => unlockedOutfitIds.has(item.id) || !isChestReward(item.id)
  );

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
        await updateChildRewards(user.uid, activeChild.id, unlockedRewards, theme.id, undefined);
        await refreshChildren();
      } catch (err) {
        console.error("Failed to update theme:", err);
      }
      setSaving(false);
    },
    [user, activeChild, activeThemeId, unlockedRewards, sfx, saving, refreshChildren]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col animate-slide-in"
      style={{ background: "var(--ck-bg) url(/bg-reward-view.webp) center / cover no-repeat" }}
    >
      {/* Soft wash so tiles and text stay readable over the illustration */}
      <div className="absolute inset-0" style={{ background: "rgba(245, 240, 255, 0.45)" }} aria-hidden="true" />

      <TopBar left={<NavIcon icon="icon-close" alt="Close" onClick={onClose} />} className="z-10" />

      {/* Piku is the point of this screen: the outfit preview, front and centre */}
      <div className="relative z-10 flex flex-col items-center shrink-0 pt-1 pb-3">
        <Image
          src="/reward-pedestal.webp"
          alt=""
          aria-hidden="true"
          width={240}
          height={77}
          className="absolute left-1/2 -translate-x-1/2 object-contain pointer-events-none"
          style={{ width: 240, height: "auto", bottom: -6 }}
          priority
        />
        <div className="relative animate-float" style={{ marginBottom: 18 }}>
          <PikuWithOutfit
            expression="standing-happy"
            headImage={previewOutfit.head}
            bodyImage={previewOutfit.body}
            size={UI.piku.hero}
          />
        </div>
      </div>

      {/* Wardrobe */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-8 flex flex-col gap-5">
        <section>
          <SectionHeading icon="hat" label={t("rewards_hats")} />
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 pt-2 px-1">
            <Tile selected={!previewOutfit.head} onClick={() => toggleOutfit("head", undefined)} label={t("rewards_none")}>
              <NothingGlyph />
            </Tile>
            {headOutfits.map((item) => (
              <Tile
                key={item.id}
                selected={previewOutfit.head === item.image}
                onClick={() => toggleOutfit("head", item.image)}
                label={t(item.nameKey as LocaleKey)}
              >
                <Image
                  src={item.iconImage ?? item.image}
                  alt=""
                  width={UI.tile.icon}
                  height={UI.tile.icon}
                  className="object-contain"
                  style={{ width: UI.tile.icon, height: UI.tile.icon }}
                />
              </Tile>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading icon="bow" label={t("rewards_accessories")} />
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 pt-2 px-1">
            <Tile selected={!previewOutfit.body} onClick={() => toggleOutfit("body", undefined)} label={t("rewards_none")}>
              <NothingGlyph />
            </Tile>
            {bodyOutfits.map((item) => (
              <Tile
                key={item.id}
                selected={previewOutfit.body === item.image}
                onClick={() => toggleOutfit("body", item.image)}
                label={t(item.nameKey as LocaleKey)}
              >
                <Image
                  src={item.iconImage ?? item.image}
                  alt=""
                  width={UI.tile.icon}
                  height={UI.tile.icon}
                  className="object-contain"
                  style={{ width: UI.tile.icon, height: UI.tile.icon }}
                />
              </Tile>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading icon="board" label={t("rewards_boards")} />
          <div className="flex flex-wrap gap-3 pt-2 px-1">
            {BOARD_THEMES.map((theme) => (
              <Tile
                key={theme.id}
                selected={theme.id === activeThemeId}
                onClick={() => selectTheme(theme)}
                label={theme.name}
              >
                <MiniBoardPreview theme={theme} px={UI.tile.size - 14} />
              </Tile>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
