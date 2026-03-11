"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GearSix, Crown } from "@phosphor-icons/react";
import JourneyMap from "@/components/JourneyMap";
import ChestOpenModal from "@/components/ChestOpenModal";
import RewardCollection from "@/components/RewardCollection";
import ChildSelector from "@/components/ChildSelector";
import AddChildModal from "@/components/AddChildModal";
import ParentSettings from "@/components/ParentSettings";
import StarCounter from "@/components/StarCounter";
import ChestPeekModal from "@/components/ChestPeekModal";
import { CHESTS } from "@/data/chests";
import { LESSONS } from "@/data/lessons";
import { useAuth } from "@/hooks/useAuth";
import { useLongPress } from "@/hooks/useLongPress";
import {
  getLessonProgress,
  updateChildProgress,
  updateChildRewards,
  addChild as addChildToFirestore,
} from "@/lib/firestore";
import type { LessonProgress } from "@/types/user";

/** Inner component that uses useSearchParams — only rendered when authenticated */
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
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
  const [showSettings, setShowSettings] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [peekChestIndex, setPeekChestIndex] = useState<number | null>(null);

  const openSettings = useCallback(() => setShowSettings(true), []);
  const longPressHandlers = useLongPress(openSettings);

  // Guard against processing completion params multiple times
  const completionProcessed = useRef(false);
  // Track whether Firestore data has loaded for the current child
  const [firestoreReady, setFirestoreReady] = useState(false);

  // Skip next Firestore sync to prevent race condition after completion
  const skipNextSync = useRef(false);

  // Unlock animation state
  const [justCompletedLesson, setJustCompletedLesson] = useState<string | null>(null);
  const [justUnlockedLesson, setJustUnlockedLesson] = useState<number | null>(null);

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

        // After completion, skip Firestore overwrite to avoid race condition
        if (skipNextSync.current) {
          skipNextSync.current = false;
        } else {
          setCurrentLesson(activeChild!.currentLesson);
          setTotalStars(activeChild!.totalStars);
        }

        // Determine opened chests from rewards
        const unlockedRewardIds = activeChild!.unlockedRewards ?? [];
        const opened = CHESTS
          .filter((chest) => chest.rewards.some((r) => unlockedRewardIds.includes(r.id)))
          .map((c) => c.index);
        setOpenedChests(opened);
        setFirestoreReady(true);
      } catch (err) {
        console.error("Failed to load lesson progress:", err);
        if (!cancelled) setFirestoreReady(true);
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
          // Trigger unlock animation if a new lesson was unlocked
          if (newCurrent > prevLesson) {
            setJustCompletedLesson(completedLessonId);
            setJustUnlockedLesson(newCurrent);
          }
          // Prevent Firestore re-fetch from overwriting optimistic state
          skipNextSync.current = true;
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

  const handleUnlockAnimationDone = useCallback(() => {
    setJustCompletedLesson(null);
    setJustUnlockedLesson(null);
  }, []);

  const handleLockedChestTap = useCallback((chestIndex: number) => {
    // Show peek modal after short delay (let shake play first)
    setTimeout(() => setPeekChestIndex(chestIndex), 500);
  }, []);

  const peekChest =
    peekChestIndex !== null
      ? CHESTS.find((c) => c.index === peekChestIndex) ?? null
      : null;

  const openedChest =
    openChestIndex !== null
      ? CHESTS.find((c) => c.index === openChestIndex) ?? null
      : null;

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
        onLockedChestTap={handleLockedChestTap}
        justCompletedLesson={justCompletedLesson}
        justUnlockedLesson={justUnlockedLesson}
        onUnlockAnimationDone={handleUnlockAnimationDone}
      />

      {/* Top-left: rewards + settings gear */}
      <div className="fixed top-4 left-4 z-30 flex items-center gap-2">
        <button
          onClick={() => setShowRewards(true)}
          className="w-9 h-9 rounded-full bg-white/60 backdrop-blur shadow-sm flex items-center justify-center active:scale-95 transition-transform"
          aria-label="My rewards"
        >
          <Crown size={18} weight="fill" style={{ color: "var(--ck-gold)" }} />
        </button>
        <button
          onClick={openSettings}
          {...longPressHandlers}
          className="w-9 h-9 rounded-full bg-white/60 backdrop-blur shadow-sm flex items-center justify-center active:scale-95 transition-transform select-none"
          aria-label="Settings"
        >
          <GearSix size={18} weight="bold" className="text-gray-400" />
        </button>
      </div>

      {/* Top-center: star counter */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30">
        <StarCounter totalStars={totalStars} animate={justCompletedLesson !== null} />
      </div>

      {/* Top-right: active child avatar (tap to switch) */}
      <button
        onClick={() => setActiveChild(null)}
        className="fixed top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center active:scale-95 transition-transform text-xl"
        aria-label="Switch child profile"
      >
        {activeChild.avatar}
      </button>

      {/* Parent settings panel */}
      <ParentSettings
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Chest open modal */}
      {openedChest && (
        <ChestOpenModal chest={openedChest} onClose={handleChestClose} />
      )}

      {/* Chest peek modal (locked chest preview) */}
      {peekChest && (
        <ChestPeekModal
          chest={peekChest}
          totalStars={totalStars}
          onClose={() => setPeekChestIndex(null)}
        />
      )}

      {/* Reward collection overlay */}
      <RewardCollection
        open={showRewards}
        onClose={() => setShowRewards(false)}
      />
    </div>
  );
}

/** Outer component handles auth gating — avoids useSearchParams when not authenticated */
function AuthGate() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

export default function Home() {
  return <AuthGate />;
}
