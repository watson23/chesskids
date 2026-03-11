"use client";

import Image from "next/image";
import Piku from "@/components/Piku";
import SpeechBubble from "@/components/SpeechBubble";
import type { TranslateFn } from "@/types/locale";

interface FeaturesSectionProps {
  t: TranslateFn;
}

import type { LocaleKey } from "@/types/locale";

const FEATURES: { titleKey: LocaleKey; descKey: LocaleKey; emoji: string; delay: string }[] = [
  {
    titleKey: "landing_feature_1_title",
    descKey: "landing_feature_1_desc",
    emoji: "♟️",
    delay: "animate-fade-in-up-d1",
  },
  {
    titleKey: "landing_feature_2_title",
    descKey: "landing_feature_2_desc",
    emoji: "⭐",
    delay: "animate-fade-in-up-d2",
  },
  {
    titleKey: "landing_feature_3_title",
    descKey: "landing_feature_3_desc",
    emoji: "🎮",
    delay: "animate-fade-in-up-d3",
  },
];

export default function FeaturesSection({ t }: FeaturesSectionProps) {
  return (
    <section className="py-16 px-6" style={{ background: "var(--ck-bg)" }}>
      <div className="max-w-md mx-auto flex flex-col items-center gap-8">
        {/* Section heading */}
        <h2
          className="text-2xl font-extrabold text-center animate-fade-in-up"
          style={{ color: "var(--ck-text)" }}
        >
          {t("landing_features_title")}
        </h2>

        {/* Piku teaching */}
        <div className="flex items-end gap-3 animate-fade-in-up">
          <Piku expression="teaching" size={60} />
          <SpeechBubble text={t("landing_features_speech")} visible />
        </div>

        {/* Feature cards */}
        <div className="flex flex-col gap-4 w-full">
          {FEATURES.map((feature) => (
            <div
              key={feature.titleKey}
              className={`card-pillow p-5 ${feature.delay}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">{feature.emoji}</span>
                <div>
                  <h3
                    className="font-bold text-base"
                    style={{ color: "var(--ck-text)" }}
                  >
                    {t(feature.titleKey)}
                  </h3>
                  <p
                    className="text-sm mt-1 leading-relaxed"
                    style={{ color: "var(--ck-text-light)" }}
                  >
                    {t(feature.descKey)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* App preview mockup */}
        <div className="animate-fade-in-up-d3 mt-4">
          <Image
            src="/landing/app-preview.webp"
            alt="My First Chess Moves app preview"
            width={280}
            height={560}
            className="drop-shadow-xl"
            style={{ width: 280, height: "auto" }}
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}
