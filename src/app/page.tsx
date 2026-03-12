"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NavIcon from "@/components/NavIcon";
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
import { resolveCurrentLessonIndex, getLessonIdAtIndex } from "@/lib/lesson-utils";
import { useAuth } from "@/hooks/useAuth";

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
          setCurrentLesson(resolveCurrentLessonIndex(activeChild!.currentLesson));
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
          // Save to Firestore (store lesson ID, not index)
          if (user && activeChild) {
            updateChildProgress(
              user.uid, activeChild.id, completedLessonId,
              stars, getLessonIdAtIndex(newCurrent), newTotal
            ).then(() => refreshChildren()).catch((err) =>
              console.error("Failed to save progress:", err)
            );

            // Unlock champion outfits when the final lesson is completed
            const isLastLesson = LESSONS[LESSONS.length - 1]?.id === completedLessonId;
            if (isLastLesson) {
              updateChildRewards(
                user.uid, activeChild.id,
                [...(activeChild.unlockedRewards ?? [])],
                undefined, undefined,
                ["champion-crown", "champion-cape"],
                { head: "champion-crown", body: "champion-cape" }
              ).then(() => refreshChildren()).catch((err) =>
                console.error("Failed to save champion rewards:", err)
              );
            }
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
        // Extract outfit IDs from chest rewards
        const outfitIds = chest.rewards
          .filter((r) => r.type === "outfit" && r.outfitId)
          .map((r) => r.outfitId!);
        updateChildRewards(
          user.uid, activeChild.id, allRewards,
          undefined, undefined, outfitIds
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
        childName={activeChild?.name}
        equippedOutfit={activeChild?.equippedOutfit}
      />

      {/* Top navigation bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-3 pt-[calc(env(safe-area-inset-top)+8px)] pb-2">
        {/* Left: rewards chest + star counter */}
        <div className="flex items-center gap-2">
          <NavIcon
            icon="icon-chest-rewards"
            alt="My rewards"
            size="md"
            onClick={() => setShowRewards(true)}
          />
          <StarCounter totalStars={totalStars} animate={justCompletedLesson !== null} />
        </div>

        {/* Right: practice, play, settings */}
        <div className="flex items-center gap-2">
          <NavIcon
            icon="icon-practice"
            alt="Practice puzzles"
            size="md"
            onClick={() => router.push("/practice")}
          />
          <NavIcon
            icon="icon-play"
            alt="Play against opponents"
            size="md"
            onClick={() => router.push("/play")}
          />
          <NavIcon
            icon="icon-settings"
            alt="Settings"
            size="md"
            onClick={() => setShowSettings(true)}
          />
        </div>
      </div>

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
