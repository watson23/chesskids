"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { speak, stopSpeaking, preloadVoices, unlockSpeech } from "@/lib/tts";
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
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    if (!enabled) stopSpeaking();
  }, []);

  // Pre-load TTS voices early so the first speak() call doesn't miss
  useEffect(() => {
    preloadVoices();
  }, []);

  // iOS/Android require the first speech to start inside a user gesture;
  // unlock on the first tap so timer-driven narrations aren't dropped
  useEffect(() => {
    const unlock = () => unlockSpeech();
    document.addEventListener("pointerdown", unlock, { once: true });
    return () => document.removeEventListener("pointerdown", unlock);
  }, []);

  // Sync language between localStorage and Firestore when user logs in
  useEffect(() => {
    if (!userSettings?.language) return;
    const local = typeof window !== "undefined" ? localStorage.getItem("mfcm_language") : null;
    if (local && (local === "fi" || local === "en") && local !== userSettings.language) {
      // User picked a language before signing in — push it to Firestore
      setLanguageState(local);
      if (user) updateUserSettings(user.uid, { language: local });
    } else {
      setLanguageState(userSettings.language);
      if (typeof window !== "undefined") {
        localStorage.setItem("mfcm_language", userSettings.language);
      }
    }
  }, [userSettings, user]);

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
