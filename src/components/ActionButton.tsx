"use client";

import Image from "next/image";
import { UI } from "@/lib/ui";

type Tone = "purple" | "gray" | "mint" | "gold";

interface ActionButtonProps {
  /** Image path under /public, e.g. "/icons/icon-retry.webp" */
  icon: string;
  /** Accessible name — these buttons carry no visible text. */
  label: string;
  onClick?: () => void;
  /**
   * "chip": a solid round tactile button with a plain icon inside
   * (retry, back, home). "illustrated": the icon artwork is already a
   * button-like illustration (green check, sparkly arrow), so it stands on
   * its own with a drop shadow. Both occupy the same UI.action footprint.
   */
  look?: "chip" | "illustrated";
  tone?: Tone;
  /** Gentle attention bounce for the one action the kid should take next. */
  bounce?: boolean;
  className?: string;
}

/**
 * Primary round action button. One footprint (UI.action) on every screen:
 * lesson next, celebration continue, rematch, back.
 */
export default function ActionButton({
  icon,
  label,
  onClick,
  look = "chip",
  tone = "purple",
  bounce = false,
  className = "",
}: ActionButtonProps) {
  const px = UI.action.button;

  if (look === "illustrated") {
    return (
      <button
        onClick={onClick}
        className={`flex items-center justify-center shrink-0 active:scale-90 transition-transform ${bounce ? "animate-bounce-gentle" : ""} ${className}`}
        style={{ width: px, height: px }}
        aria-label={label}
      >
        <Image
          src={icon}
          alt=""
          width={px}
          height={px}
          className="object-contain drop-shadow-lg"
          style={{ width: px, height: px }}
          draggable={false}
        />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`btn-3d btn-3d-${tone} btn-round shrink-0 ${bounce ? "animate-bounce-gentle" : ""} ${className}`}
      style={{ width: px, height: px }}
      aria-label={label}
    >
      <Image
        src={icon}
        alt=""
        width={UI.action.icon}
        height={UI.action.icon}
        className="object-contain"
        style={{ width: UI.action.icon, height: UI.action.icon }}
        draggable={false}
      />
    </button>
  );
}
