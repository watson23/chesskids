"use client";

import Image from "next/image";
import Piku from "@/components/Piku";
import SpeechBubble from "@/components/SpeechBubble";
import { useAudio } from "@/hooks/useAudio";
import type { TranslateFn } from "@/types/locale";

interface HeroSectionProps {
  t: TranslateFn;
  onPlayFree: () => void;
}

export default function HeroSection({ t, onPlayFree }: HeroSectionProps) {
  const { language, setLanguage } = useAudio();

  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden px-6">
      {/* Language toggle — top-right corner */}
      <div className="absolute top-4 right-4 z-20 flex gap-1.5">
        <button
          onClick={() => setLanguage("en")}
          className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
            language === "en"
              ? "bg-white/90 shadow-md ring-2 ring-amber-400"
              : "bg-white/40 hover:bg-white/60"
          }`}
          aria-label="English"
        >
          🇬🇧
        </button>
        <button
          onClick={() => setLanguage("fi")}
          className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
            language === "fi"
              ? "bg-white/90 shadow-md ring-2 ring-amber-400"
              : "bg-white/40 hover:bg-white/60"
          }`}
          aria-label="Suomi"
        >
          🇫🇮
        </button>
      </div>

      {/* Warm gradient background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "url(/landing/hero-bg.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
        }}
      />

      {/* Floating kawaii chess pieces — decorative */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src="/landing/floating-pieces.webp"
          alt=""
          width={320}
          height={320}
          className="absolute top-[8%] left-[-4%] opacity-40 animate-float-slow"
          style={{ width: 160, height: 160 }}
          draggable={false}
        />
        <Image
          src="/landing/floating-pieces.webp"
          alt=""
          width={320}
          height={320}
          className="absolute top-[15%] right-[-2%] opacity-30 animate-float-slow"
          style={{ width: 120, height: 120, animationDelay: "2s", transform: "scaleX(-1)" }}
          draggable={false}
        />
        <Image
          src="/landing/floating-pieces.webp"
          alt=""
          width={320}
          height={320}
          className="absolute bottom-[20%] right-[5%] opacity-25 animate-float-slow"
          style={{ width: 100, height: 100, animationDelay: "4s" }}
          draggable={false}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center gap-4 animate-fade-in-up">
        {/* Piku waving */}
        <div className="animate-float">
          <Piku expression="wave" size={180} />
        </div>

        {/* Speech bubble */}
        <SpeechBubble text={t("landing_hero_speech")} visible />

        {/* Title */}
        <h1
          className="text-5xl font-extrabold tracking-tight text-center mt-2"
          style={{ color: "var(--ck-text)" }}
        >
          {t("landing_hero_title")}
        </h1>

        <p
          className="text-lg font-medium text-center max-w-xs"
          style={{ color: "var(--ck-text-light)" }}
        >
          {t("landing_hero_subtitle")}
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
          <button
            onClick={onPlayFree}
            className="btn-3d btn-3d-purple w-full text-center"
          >
            {t("landing_cta_play")}
          </button>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 flex flex-col items-center gap-1 animate-gentle-bounce opacity-70">
        <span className="text-xs font-bold" style={{ color: "var(--ck-text-light)" }}>
          {language === "fi" ? "Lue lisää" : "Learn more"}
        </span>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M7 10l5 5 5-5" stroke="var(--ck-text-light)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
