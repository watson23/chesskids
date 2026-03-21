import {
  doc, collection, getDocs, writeBatch,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { getChildren } from "@/lib/firestore";

/**
 * Delete all Firestore data for a user: user doc, all children,
 * and all nested progress/puzzleProgress subcollections.
 *
 * Firebase Auth account deletion and localStorage cleanup are
 * handled by the caller (useAuth.deleteAccount).
 */
export async function deleteUserAccount(uid: string): Promise<void> {
  const db = getDb();
  const children = await getChildren(uid);

  // Collect all document refs to delete
  const refs: ReturnType<typeof doc>[] = [];

  for (const child of children) {
    // Progress subcollection
    const progressSnap = await getDocs(
      collection(db, "users", uid, "children", child.id, "progress")
    );
    progressSnap.docs.forEach((d) => refs.push(d.ref));

    // Puzzle progress subcollection
    const puzzleSnap = await getDocs(
      collection(db, "users", uid, "children", child.id, "puzzleProgress")
    );
    puzzleSnap.docs.forEach((d) => refs.push(d.ref));

    // Child doc itself
    refs.push(doc(db, "users", uid, "children", child.id));
  }

  // User doc
  refs.push(doc(db, "users", uid));

  // Firestore writeBatch supports max 500 operations — chunk if needed
  const BATCH_LIMIT = 499;
  for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    const chunk = refs.slice(i, i + BATCH_LIMIT);
    chunk.forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}
