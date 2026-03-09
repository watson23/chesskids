"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import JourneyMap from "@/components/JourneyMap";
import ChestOpenModal from "@/components/ChestOpenModal";
import ChildSelector from "@/components/ChildSelector";
import AddChildModal from "@/components/AddChildModal";
import { CHESTS } from "@/data/chests";
import { LESSONS } from "@/data/lessons";
import { useAudio } from "@/hooks/useAudio";
import { useAuth } from "@/hooks/useAuth";
import {
  getLessonProgress,
  updateChildProgress,
  updateChildRewards,
  addChild as addChildToFirestore,
} from "@/lib/firestore";
import type { LessonProgress } from "@/types/user";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, setLanguage, soundEnabled, setSoundEnabled } = useAudio();
  const {
    user,
    loading,
    children: childProfiles,
    activeChild,
    setActiveChild,
    refreshChildren,
  } = useAuth();

  const [currentLesson, setCurrentLesson] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({});
  const [openedChests, setOpenedChests] = useState<number[]>([]);
  const [openChestIndex, setOpenChestIndex] = useState<number | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);

  // Guard against processing completion params multiple times
  const completionProcessed = useRef(false);
  // Track whether Firestore data has loaded for the current child
  const [firestoreReady, setFirestoreReady] = useState(false);

  /** Load progress from Firestore when activeChild changes */
  useEffect(() => {
    if (!user || !activeChild) return;
    let cancelled = false;
    setFirestoreReady(false);

    async function load() {
      try {
        const progress = await getLessonProgress(user!.uid, activeChild!.id);
        if (cancelled) return;
        setLessonProgress(progress);
        setCurrentLesson(activeChild!.currentLesson);
        setTotalStars(activeChild!.totalStars);

        // Determine opened chests from rewards
        const unlockedRewardIds = activeChild!.unlockedRewards ?? [];
        const opened = CHESTS
          .filter((chest) => chest.rewards.some((r) => unlockedRewardIds.includes(r.id)))
          .map((c) => c.index);
        setOpenedChests(opened);
        setFirestoreReady(true);
      } catch (err) {
        console.error("Failed to load lesson progress:", err);
      }
    }

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, activeChild?.id]);

  /** Handle lesson completion via URL search params */
  const processCompletion = useCallback(
    (completedLessonId: string, stars: number, existing: LessonProgress | undefined) => {
      // Calculate new totals
      const lessonIndex = LESSONS.findIndex((l) => l.id === completedLessonId);
      const oldStarsForLesson = existing?.stars ?? 0;
      const starsDelta = stars - oldStarsForLesson;

      setTotalStars((prev) => {
        const newTotal = prev + starsDelta;
        setCurrentLesson((prevLesson) => {
          const newCurrent = Math.max(prevLesson, lessonIndex + 1);
          // Save to Firestore (using computed new values)
          if (user && activeChild) {
            updateChildProgress(
              user.uid, activeChild.id, completedLessonId,
              stars, newCurrent, newTotal
            ).then(() => refreshChildren()).catch((err) =>
              console.error("Failed to save progress:", err)
            );
          }
          return newCurrent;
        });
        return newTotal;
      });

      setLessonProgress((prev) => ({
        ...prev,
        [completedLessonId]: {
          lessonId: completedLessonId,
          stars,
          completedAt: new Date(),
          attempts: (existing?.attempts ?? 0) + 1,
        },
      }));
    },
    [user, activeChild, refreshChildren]
  );

  useEffect(() => {
    if (!user || !activeChild || !firestoreReady || completionProcessed.current) return;

    const completedLessonId = searchParams.get("completed");
    const starsParam = searchParams.get("stars");
    if (!completedLessonId || !starsParam) return;

    completionProcessed.current = true;
    const stars = parseInt(starsParam, 10);
    if (isNaN(stars) || stars < 1 || stars > 3) {
      router.replace("/", { scroll: false });
      return;
    }

    // Only save if this is a new completion or the stars improved
    const existing = lessonProgress[completedLessonId];
    if (existing && existing.stars >= stars) {
      router.replace("/", { scroll: false });
      return;
    }

    processCompletion(completedLessonId, stars, existing);

    // Clear URL params
    router.replace("/", { scroll: false });
  }, [
    user, activeChild, firestoreReady, searchParams,
    lessonProgress, router, processCompletion,
  ]);

  // Reset completion guard when search params change
  useEffect(() => {
    completionProcessed.current = false;
  }, [searchParams]);

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
    if (openChestIndex !== null && user && activeChild) {
      setOpenedChests((prev) =>
        prev.includes(openChestIndex) ? prev : [...prev, openChestIndex]
      );

      // Save rewards to Firestore
      const chest = CHESTS.find((c) => c.index === openChestIndex);
      if (chest) {
        const newRewardIds = chest.rewards.map((r) => r.id);
        const allRewards = [
          ...(activeChild.unlockedRewards ?? []),
          ...newRewardIds.filter((id) => !(activeChild.unlockedRewards ?? []).includes(id)),
        ];
        // Extract theme/pieceColor from the chest rewards
        const themeReward = chest.rewards.find((r) => r.type === "board-theme");
        const pieceReward = chest.rewards.find((r) => r.type === "piece-color");
        updateChildRewards(
          user.uid, activeChild.id, allRewards,
          themeReward?.themeId, pieceReward?.pieceColorId
        ).then(() => refreshChildren()).catch((err) =>
          console.error("Failed to save rewards:", err)
        );
      }
    }
    setOpenChestIndex(null);
  }, [openChestIndex, user, activeChild, refreshChildren]);

  const handleAddChild = useCallback(
    async (name: string, avatar: string) => {
      if (!user) return;
      try {
        const child = await addChildToFirestore(user.uid, name, avatar);
        await refreshChildren();
        setActiveChild(child);
      } catch (err) {
        console.error("Failed to add child:", err);
      }
      setShowAddChild(false);
    },
    [user, refreshChildren, setActiveChild]
  );

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

  // Loading state
  if (loading) return null;

  // Not logged in — redirect to login
  if (!user) {
    router.replace("/login");
    return null;
  }

  // Logged in but no active child — show child selector
  if (!activeChild) {
    return (
      <>
        <ChildSelector
          profiles={childProfiles}
          onSelect={setActiveChild}
          onAddChild={() => setShowAddChild(true)}
        />
        {showAddChild && (
          <AddChildModal
            onAdd={handleAddChild}
            onCancel={() => setShowAddChild(false)}
          />
        )}
      </>
    );
  }

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

      {/* Top-left: active child avatar (tap to switch) */}
      <button
        onClick={() => setActiveChild(null)}
        className="fixed top-4 left-4 z-30 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center active:scale-95 transition-transform text-xl"
        aria-label="Switch child profile"
      >
        {activeChild.avatar}
      </button>

      {/* Chest open modal */}
      {openedChest && (
        <ChestOpenModal chest={openedChest} onClose={handleChestClose} />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
