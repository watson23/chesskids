"use client";

import { useEffect } from "react";
import { useAudio } from "@/hooks/useAudio";

/**
 * Syncs the <html lang> attribute with the user's chosen language.
 * Rendered inside <body> since <html> is a server component.
 */
export default function HtmlLangSync() {
  const { language } = useAudio();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
