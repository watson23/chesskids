"use client";

import { useAudio } from "@/hooks/useAudio";

/**
 * Returns a translation function `t(key)` that looks up a locale key
 * for the current language, falling back to English, then to the raw key.
 *
 * Delegates to AudioProvider which owns the locale data (single source of truth).
 */
export function useLocale() {
  const { t, language } = useAudio();
  return { t, language };
}
