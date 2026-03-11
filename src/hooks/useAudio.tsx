"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { speak, stopSpeaking } from "@/lib/tts";
import { playSound } from "@/lib/sounds";
import type { SoundEffect } from "@/types/audio";
import type { LocaleKey } from "@/types/locale";

import en from "@/data/locale/en.json";
import fi from "@/data/locale/fi.json";

const locales: Record<string, Record<string, string>> = { en, fi };

interface AudioContextValue {
  language: "fi" | "en";
  setLanguage: (lang: "fi" | "en") => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  say: (key: LocaleKey) => Promise<void>;
  sfx: (effect: SoundEffect) => void;
  stop: () => void;
  t: (key: LocaleKey) => string;
}

const AudioCtx = createContext<AudioContextValue>({
  language: "en",
  setLanguage: () => {},
  soundEnabled: true,
  setSoundEnabled: () => {},
  say: async () => {},
  sfx: () => {},
  stop: () => {},
  t: (key: LocaleKey) => key,
});

export function AudioProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<"fi" | "en">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mfcm_language");
      if (saved === "fi" || saved === "en") return saved;
    }
    return "en";
  });
  const [soundEnabled, setSoundEnabled] = useState(true);

  const setLanguage = useCallback((lang: "fi" | "en") => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("mfcm_language", lang);
    }
  }, []);

  const say = useCallback(
    async (key: LocaleKey) => {
      if (!soundEnabled) return;
      const text = locales[language]?.[key] || locales.en[key] || key;
      await speak(text, { lang: language });
    },
    [language, soundEnabled]
  );

  const sfx = useCallback(
    (effect: SoundEffect) => {
      if (!soundEnabled) return;
      playSound(effect);
    },
    [soundEnabled]
  );

  const stop = useCallback(() => {
    stopSpeaking();
  }, []);

  const t = useCallback(
    (key: LocaleKey): string => {
      return locales[language]?.[key] || locales.en[key] || key;
    },
    [language]
  );

  return (
    <AudioCtx.Provider
      value={{
        language,
        setLanguage,
        soundEnabled,
        setSoundEnabled,
        say,
        sfx,
        stop,
        t,
      }}
    >
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  return useContext(AudioCtx);
}
