"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { speak, stopSpeaking } from "@/lib/tts";
import { playSound } from "@/lib/sounds";
import { useAuth } from "@/hooks/useAuth";
import { updateUserSettings } from "@/lib/firestore";
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
  const { user, userSettings } = useAuth();

  const [language, setLanguageState] = useState<"fi" | "en">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mfcm_language");
      if (saved === "fi" || saved === "en") return saved;
    }
    return "en";
  });
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync language from Firestore when user logs in
  useEffect(() => {
    if (userSettings?.language) {
      setLanguageState(userSettings.language);
      if (typeof window !== "undefined") {
        localStorage.setItem("mfcm_language", userSettings.language);
      }
    }
  }, [userSettings]);

  const setLanguage = useCallback((lang: "fi" | "en") => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("mfcm_language", lang);
    }
    // Persist to Firestore
    if (user) {
      updateUserSettings(user.uid, { language: lang });
    }
  }, [user]);

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
