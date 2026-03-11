import {
  doc, getDoc, setDoc, updateDoc, collection,
  getDocs, addDoc, serverTimestamp, writeBatch
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { LESSONS } from "@/data/lessons";
import type { UserDocument, ChildProfile, LessonProgress, UserSettings } from "@/types/user";

export async function getOrCreateUser(uid: string, email: string, displayName: string): Promise<UserDocument> {
  const db = getDb();
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserDocument;
  const userData: UserDocument = {
    email, displayName,
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
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChildProfile));
}

export async function addChild(uid: string, name: string, avatar: string): Promise<ChildProfile> {
  const db = getDb();
  const colRef = collection(db, "users", uid, "children");
  const child: Omit<ChildProfile, "id"> = {
    name, avatar, currentLesson: LESSONS[0]?.id ?? "", totalStars: 0,
    unlockedRewards: [], activeBoardTheme: "classic", activePieceColor: "classic",
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
  snap.docs.forEach((d) => { const data = d.data() as LessonProgress; progress[data.lessonId] = data; });
  return progress;
}

export async function updateUserSettings(uid: string, settings: Partial<UserSettings>): Promise<void> {
  const db = getDb();
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { settings });
}

export async function updateChildRewards(uid: string, childId: string, rewards: string[], theme?: string, pieceColor?: string): Promise<void> {
  const db = getDb();
  const ref = doc(db, "users", uid, "children", childId);
  const updates: Record<string, unknown> = { unlockedRewards: rewards };
  if (theme) updates.activeBoardTheme = theme;
  if (pieceColor) updates.activePieceColor = pieceColor;
  await updateDoc(ref, updates);
}
