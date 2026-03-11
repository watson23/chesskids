"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { getOrCreateUser, getChildren } from "@/lib/firestore";
import type { ChildProfile } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<User | null>;
  signInAnon: () => Promise<User | null>;
  signOut: () => Promise<void>;
  children: ChildProfile[];
  activeChild: ChildProfile | null;
  setActiveChild: (child: ChildProfile | null) => void;
  refreshChildren: () => Promise<void>;
}

const AuthCtx = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => null,
  signInAnon: async () => null,
  signOut: async () => {},
  children: [],
  activeChild: null,
  setActiveChild: () => {},
  refreshChildren: async () => {},
});

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export function AuthProvider({
  children: reactChildren,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [activeChild, setActiveChildState] = useState<ChildProfile | null>(null);

  /** Load user document and children from Firestore */
  const loadUserData = useCallback(async (u: User) => {
    try {
      await getOrCreateUser(u.uid, u.email ?? "", u.displayName ?? "");
      const kids = await getChildren(u.uid);
      setChildProfiles(kids);

      // Restore previously-selected child from localStorage, or default to first
      const savedChildId =
        typeof window !== "undefined"
          ? localStorage.getItem(`mfcm_activeChild_${u.uid}`)
          : null;
      const savedChild = savedChildId ? kids.find((k) => k.id === savedChildId) : null;
      setActiveChildState(savedChild ?? kids[0] ?? null);
    } catch (err) {
      console.error("Failed to load user data from Firestore:", err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (u) => {
      setUser(u);
      if (u) {
        await loadUserData(u);
      } else {
        setChildProfiles([]);
        setActiveChildState(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [loadUserData]);

  const signIn = async (): Promise<User | null> => {
    const result = await signInWithPopup(getFirebaseAuth(), googleProvider);
    return result.user;
  };

  const signInAnon = async (): Promise<User | null> => {
    const result = await signInAnonymously(getFirebaseAuth());
    return result.user;
  };

  const signOut = async () => {
    await firebaseSignOut(getFirebaseAuth());
    setChildProfiles([]);
    setActiveChildState(null);
  };

  const setActiveChild = useCallback(
    (child: ChildProfile | null) => {
      setActiveChildState(child);
      if (user && child) {
        localStorage.setItem(`mfcm_activeChild_${user.uid}`, child.id);
      }
    },
    [user]
  );

  const refreshChildren = useCallback(async () => {
    if (!user) return;
    const kids = await getChildren(user.uid);
    setChildProfiles(kids);

    // If the active child was deleted or doesn't exist, reset selection
    if (activeChild && !kids.find((k) => k.id === activeChild.id)) {
      setActiveChildState(kids[0] ?? null);
    }
    // If active child still exists, update its data from Firestore
    const updatedActive = activeChild ? kids.find((k) => k.id === activeChild.id) : null;
    if (updatedActive) {
      setActiveChildState(updatedActive);
    }
  }, [user, activeChild]);

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        signIn,
        signInAnon,
        signOut,
        children: childProfiles,
        activeChild,
        setActiveChild,
        refreshChildren,
      }}
    >
      {reactChildren}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
