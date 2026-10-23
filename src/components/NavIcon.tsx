"use client";

import Image from "next/image";
import { UI } from "@/lib/ui";

interface NavIconProps {
  icon: string;          // filename in /icons/, e.g. "icon-home"
  alt: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Round frosted navigation button. One size everywhere (UI.nav) so the
 * top bars of the map, lessons, practice, play and game all line up.
 */
export default function NavIcon({
  icon,
  alt,
  onClick,
  className = "",
  disabled = false,
}: NavIconProps) {
  const px = UI.nav.button;
  const imgPx = UI.nav.icon;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`nav-button shrink-0 ${disabled ? "opacity-40 cursor-default" : ""} ${className}`}
      style={{ width: px, height: px }}
      aria-label={alt}
    >
      <Image
        src={`/icons/${icon}.webp`}
        alt={alt}
        width={imgPx}
        height={imgPx}
        className="object-contain"
        style={{ width: imgPx, height: imgPx }}
        draggable={false}
      />
    </button>
  );
}
