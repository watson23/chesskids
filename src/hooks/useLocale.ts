"use client";

import { useCallback } from "react";
import { useAudio } from "@/hooks/useAudio";

import en from "@/data/locale/en.json";
import fi from "@/data/locale/fi.json";

const locales: Record<string, Record<string, string>> = { en, fi };

/**
 * Returns a translation function `t(key)` that looks up a locale key
 * for the current language, falling back to English, then to the raw key.
 */
export function useLocale() {
  const { language } = useAudio();

  const t = useCallback(
    (key: string): string => {
      return locales[language]?.[key] || locales.en[key] || key;
    },
    [language]
  );

  return { t, language };
}
