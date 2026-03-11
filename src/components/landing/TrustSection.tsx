"use client";

import Piku from "@/components/Piku";
import type { TranslateFn, LocaleKey } from "@/types/locale";

interface TrustSectionProps {
  t: TranslateFn;
}

const BADGES: { titleKey: LocaleKey; descKey: LocaleKey; icon: string }[] = [
  { titleKey: "landing_trust_no_ads", descKey: "landing_trust_no_ads_desc", icon: "🛡️" },
  { titleKey: "landing_trust_no_reading", descKey: "landing_trust_no_reading_desc", icon: "👁️" },
  { titleKey: "landing_trust_age", descKey: "landing_trust_age_desc", icon: "👶" },
  { titleKey: "landing_trust_free", descKey: "landing_trust_free_desc", icon: "⭐" },
];

export default function TrustSection({ t }: TrustSectionProps) {
  return (
    <section
      className="py-16 px-6"
      style={{
        background: "linear-gradient(180deg, var(--ck-bg) 0%, #EDE4FF 100%)",
      }}
    >
      <div className="max-w-md mx-auto flex flex-col items-center gap-8">
        {/* Section heading */}
        <h2
          className="text-2xl font-extrabold text-center animate-fade-in-up"
          style={{ color: "var(--ck-text)" }}
        >
          {t("landing_trust_title")}
        </h2>

        {/* Trust badges grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {BADGES.map((badge, i) => (
            <div
              key={badge.titleKey}
              className={`card-pillow p-4 flex flex-col items-center text-center gap-2 ${
                i === 0
                  ? "animate-fade-in-up"
                  : i === 1
                    ? "animate-fade-in-up-d1"
                    : i === 2
                      ? "animate-fade-in-up-d2"
                      : "animate-fade-in-up-d3"
              }`}
            >
              <span className="text-3xl">{badge.icon}</span>
              <h3
                className="font-bold text-sm"
                style={{ color: "var(--ck-text)" }}
              >
                {t(badge.titleKey)}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--ck-text-light)" }}
              >
                {t(badge.descKey)}
              </p>
            </div>
          ))}
        </div>

        {/* Piku celebrating in corner */}
        <div className="animate-gentle-bounce">
          <Piku expression="celebrating" size={50} />
        </div>
      </div>
    </section>
  );
}
