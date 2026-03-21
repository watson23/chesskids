"use client";

import Link from "next/link";
import Piku from "@/components/Piku";
import SpeechBubble from "@/components/SpeechBubble";
import type { TranslateFn } from "@/types/locale";

interface CTASectionProps {
  t: TranslateFn;
  onPlayFree: () => void;
}

export default function CTASection({ t, onPlayFree }: CTASectionProps) {
  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Background — kingdom gate */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "url(/landing/cta-bg.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Slight overlay for text readability */}
      <div className="absolute inset-0 z-0 bg-white/30" />

      <div className="relative max-w-md mx-auto flex flex-col items-center gap-6 animate-fade-in-up">
        {/* Piku holding pawn */}
        <div className="animate-float">
          <Piku expression="holding-pawn" size={150} />
        </div>

        <SpeechBubble text={t("landing_cta_speech")} visible />

        <h2
          className="text-2xl font-extrabold text-center"
          style={{ color: "var(--ck-text)" }}
        >
          {t("landing_cta_title")}
        </h2>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={onPlayFree}
            className="btn-3d btn-3d-purple w-full text-center"
          >
            {t("landing_cta_play")}
          </button>

        </div>

        {/* Footer */}
        <p
          className="text-xs mt-8 text-center"
          style={{ color: "var(--ck-text-light)" }}
        >
          Piku Chess — {t("landing_footer")} ❤️
        </p>
        <Link
          href="/privacy"
          className="text-xs underline opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: "var(--ck-text-light)" }}
        >
          {t("landing_privacy")}
        </Link>
      </div>
    </section>
  );
}
