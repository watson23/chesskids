import {
  doc, getDoc, setDoc, updateDoc, collection,
  getDocs, addDoc, serverTimestamp, writeBatch, arrayUnion
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { LESSONS } from "@/data/lessons";
import type { UserDocument, ChildProfile, LessonProgress, PuzzleProgress, UserSettings } from "@/types/user";

// ---------------------------------------------------------------------------
// Lightweight runtime validation for Firestore reads
// ---------------------------------------------------------------------------

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function validateChildProfile(data: unknown, id: string): ChildProfile {
  if (!isRecord(data)) throw new Error(`Invalid child profile doc: ${id}`);
  return {
    id,
    name: typeof data.name === "string" ? data.name : "",
    avatar: typeof data.avatar === "string" ? data.avatar : "🐧",
    currentLesson: typeof data.currentLesson === "string" || typeof data.currentLesson === "number"
      ? data.currentLesson as string | number
      : LESSONS[0]?.id ?? "",
    totalStars: typeof data.totalStars === "number" ? data.totalStars : 0,
    unlockedRewards: Array.isArray(data.unlockedRewards) ? data.unlockedRewards.filter((x): x is string => typeof x === "string") : [],
    activeBoardTheme: typeof data.activeBoardTheme === "string" ? data.activeBoardTheme : "classic",
    activePieceColor: typeof data.activePieceColor === "string" ? data.activePieceColor : "classic",
    equippedOutfit: isRecord(data.equippedOutfit) ? {
      head: typeof data.equippedOutfit.head === "string" ? data.equippedOutfit.head : undefined,
      body: typeof data.equippedOutfit.body === "string" ? data.equippedOutfit.body : undefined,
    } : {},
    unlockedOutfits: Array.isArray(data.unlockedOutfits) ? data.unlockedOutfits.filter((x): x is string => typeof x === "string") : [],
  };
}

function validateLessonProgress(data: unknown): LessonProgress | null {
  if (!isRecord(data)) return null;
  if (typeof data.lessonId !== "string") return null;
  return {
    lessonId: data.lessonId,
    stars: typeof data.stars === "number" ? data.stars : 0,
    completedAt: data.completedAt,
    attempts: typeof data.attempts === "number" ? data.attempts : 1,
  };
}

function validatePuzzleProgress(data: unknown): PuzzleProgress | null {
  if (!isRecord(data)) return null;
  if (typeof data.puzzleId !== "string") return null;
  return {
    puzzleId: data.puzzleId,
    solved: typeof data.solved === "boolean" ? data.solved : false,
    attempts: typeof data.attempts === "number" ? data.attempts : 1,
  };
}

export async function getOrCreateUser(uid: string): Promise<UserDocument> {
  const db = getDb();
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserDocument;
  const userData: UserDocument = {
    settings: { language: "en", soundEnabled: true, ttsProvider: "browser" },
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, userData);
  return userData;
}

export async function getChildren(uid: string): Promise<ChildProfile[]> {
  const db = getDb();
  const colRef = collection(db, "users", uid, "children");
  const snap = await getDocs(colRef);
  return snap.docs.map((d) => validateChildProfile(d.data(), d.id));
}

export async function addChild(uid: string, name: string, avatar: string): Promise<ChildProfile> {
  const db = getDb();
  const colRef = collection(db, "users", uid, "children");
  const child: Omit<ChildProfile, "id"> = {
    name, avatar, currentLesson: LESSONS[0]?.id ?? "", totalStars: 0,
    unlockedRewards: [], activeBoardTheme: "classic", activePieceColor: "classic",
    equippedOutfit: {}, unlockedOutfits: [],
  };
  const docRef = await addDoc(colRef, child);
  return { id: docRef.id, ...child };
}

export async function updateChildProgress(
  uid: string, childId: string, lessonId: string,
  stars: number, newCurrentLessonId: string, newTotalStars: number
): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  const childRef = doc(db, "users", uid, "children", childId);
  batch.update(childRef, { currentLesson: newCurrentLessonId, totalStars: newTotalStars });
  const progressRef = doc(db, "users", uid, "children", childId, "progress", lessonId);
  batch.set(progressRef, { lessonId, stars, completedAt: serverTimestamp(), attempts: 1 });
  await batch.commit();
}

export async function getLessonProgress(uid: string, childId: string): Promise<Record<string, LessonProgress>> {
  const db = getDb();
  const colRef = collection(db, "users", uid, "children", childId, "progress");
  const snap = await getDocs(colRef);
  const progress: Record<string, LessonProgress> = {};
  snap.docs.forEach((d) => {
    const validated = validateLessonProgress(d.data());
    if (validated) progress[validated.lessonId] = validated;
  });
  return progress;
}

export async function updateUserSettings(uid: string, settings: Partial<UserSettings>): Promise<void> {
  const db = getDb();
  const ref = doc(db, "users", uid);
  // Use dot notation to merge individual fields instead of overwriting entire settings object
  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(settings)) {
    updates[`settings.${key}`] = value;
  }
  await updateDoc(ref, updates);
}

export async function getPuzzleProgress(
  uid: string, childId: string
): Promise<Record<string, PuzzleProgress>> {
  const db = getDb();
  const colRef = collection(db, "users", uid, "children", childId, "puzzleProgress");
  const snap = await getDocs(colRef);
  const progress: Record<string, PuzzleProgress> = {};
  snap.docs.forEach((d) => {
    const validated = validatePuzzleProgress(d.data());
    if (validated) progress[validated.puzzleId] = validated;
  });
  return progress;
}

export async function markPuzzleSolved(
  uid: string, childId: string, puzzleId: string
): Promise<void> {
  const db = getDb();
  const ref = doc(db, "users", uid, "children", childId, "puzzleProgress", puzzleId);
  await setDoc(ref, { puzzleId, solved: true, attempts: 1 }, { merge: true });
}

export async function updateChildRewards(uid: string, childId: string, rewards: string[], theme?: string, pieceColor?: string, outfitUnlocks?: string[], equippedOutfit?: { head?: string; body?: string }): Promise<void> {
  const db = getDb();
  const ref = doc(db, "users", uid, "children", childId);
  const updates: Record<string, unknown> = { unlockedRewards: rewards };
  if (theme) updates.activeBoardTheme = theme;
  if (pieceColor) updates.activePieceColor = pieceColor;
  if (outfitUnlocks && outfitUnlocks.length > 0) updates.unlockedOutfits = arrayUnion(...outfitUnlocks);
  if (equippedOutfit) updates.equippedOutfit = equippedOutfit;
  await updateDoc(ref, updates);
}

export async function updateEquippedOutfit(
  uid: string,
  childId: string,
  equippedOutfit: { head?: string; body?: string }
): Promise<void> {
  const db = getDb();
  const ref = doc(db, "users", uid, "children", childId);
  await updateDoc(ref, { equippedOutfit });
}
