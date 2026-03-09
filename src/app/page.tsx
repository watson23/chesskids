"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import JourneyMap from "@/components/JourneyMap";
import ChestOpenModal from "@/components/ChestOpenModal";
import { CHESTS } from "@/data/chests";
import { useAudio } from "@/hooks/useAudio";
import type { LessonProgress } from "@/types/user";

export default function Home() {
  const router = useRouter();
  const { language, setLanguage, soundEnabled, setSoundEnabled } = useAudio();

  // Local state — will be connected to Firestore in Task 11
  const [currentLesson] = useState(0);
  const [totalStars] = useState(0);
  const [lessonProgress] = useState<Record<string, LessonProgress>>({});
  const [openedChests, setOpenedChests] = useState<number[]>([]);
  const [openChestIndex, setOpenChestIndex] = useState<number | null>(null);

  const handleLessonTap = useCallback(
    (lessonId: string) => {
      router.push(`/learn/${lessonId}`);
    },
    [router]
  );

  const handleChestTap = useCallback(
    (chestIndex: number) => {
      setOpenChestIndex(chestIndex);
    },
    []
  );

  const handleChestClose = useCallback(() => {
    if (openChestIndex !== null) {
      setOpenedChests((prev) =>
        prev.includes(openChestIndex) ? prev : [...prev, openChestIndex]
      );
    }
    setOpenChestIndex(null);
  }, [openChestIndex]);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "fi" : "en");
  }, [language, setLanguage]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(!soundEnabled);
  }, [soundEnabled, setSoundEnabled]);

  const openedChest =
    openChestIndex !== null
      ? CHESTS.find((c) => c.index === openChestIndex) ?? null
      : null;

  return (
    <div className="relative min-h-dvh">
      {/* Journey Map */}
      <JourneyMap
        currentLesson={currentLesson}
        lessonProgress={lessonProgress}
        totalStars={totalStars}
        openedChests={openedChests}
        onLessonTap={handleLessonTap}
        onChestTap={handleChestTap}
      />

      {/* Top-right floating controls */}
      <div className="fixed top-4 right-4 z-30 flex gap-2">
        <button
          onClick={toggleSound}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center active:scale-95 transition-transform"
          aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
        >
          {soundEnabled ? (
            <SpeakerHigh size={22} weight="bold" className="text-amber-700" />
          ) : (
            <SpeakerSlash size={22} weight="bold" className="text-gray-400" />
          )}
        </button>

        <button
          onClick={toggleLanguage}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center active:scale-95 transition-transform text-lg"
          aria-label={`Switch language to ${language === "en" ? "Finnish" : "English"}`}
        >
          {language === "en" ? "\ud83c\uddec\ud83c\udde7" : "\ud83c\uddeb\ud83c\uddee"}
        </button>
      </div>

      {/* Parent settings long-press area (prep for Task 12) */}
      <div
        className="fixed top-4 left-4 z-30 w-10 h-10"
        aria-hidden="true"
      />

      {/* Chest open modal */}
      {openedChest && (
        <ChestOpenModal chest={openedChest} onClose={handleChestClose} />
      )}
    </div>
  );
}
