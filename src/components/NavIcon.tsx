"use client";

import Image from "next/image";

interface NavIconProps {
  icon: string;          // filename in /icons/, e.g. "icon-home"
  alt: string;
  size?: "sm" | "md";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function NavIcon({
  icon,
  alt,
  size = "sm",
  onClick,
  className = "",
  disabled = false,
}: NavIconProps) {
  const px = size === "md" ? 44 : 36;
  const imgPx = size === "md" ? 32 : 24;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center rounded-full bg-white/70 backdrop-blur shadow-sm active:scale-95 transition-transform ${
        disabled ? "opacity-40" : ""
      } ${className}`}
      style={{ width: px, height: px }}
      aria-label={alt}
    >
      <Image
        src={`/icons/${icon}.webp`}
        alt={alt}
        width={imgPx}
        height={imgPx}
        className="object-contain"
        style={{ width: imgPx, height: "auto" }}
      />
    </button>
  );
}
