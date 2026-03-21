"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { getOrCreateUser, getChildren } from "@/lib/firestore";
import { deleteUserAccount } from "@/lib/account-deletion";
import type { ChildProfile, UserSettings } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInAnon: () => Promise<User | null>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  children: ChildProfile[];
  activeChild: ChildProfile | null;
  setActiveChild: (child: ChildProfile | null) => void;
  refreshChildren: () => Promise<void>;
  userSettings: UserSettings | null;
}

const AuthCtx = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signInAnon: async () => null,
  signOut: async () => {},
  deleteAccount: async () => {},
  children: [],
  activeChild: null,
  setActiveChild: () => {},
  refreshChildren: async () => {},
  userSettings: null,
});

export function AuthProvider({
  children: reactChildren,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [activeChild, setActiveChildState] = useState<ChildProfile | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const activeChildRef = useRef<ChildProfile | null>(null);

  // Keep ref in sync so refreshChildren can read latest without stale closure
  activeChildRef.current = activeChild;

  /** Load user document and children from Firestore */
  const loadUserData = useCallback(async (u: User) => {
    try {
      const userData = await getOrCreateUser(u.uid);
      if (userData.settings) setUserSettings(userData.settings);
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
        setUserSettings(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [loadUserData]);

  const signInAnon = async (): Promise<User | null> => {
    const result = await signInAnonymously(getFirebaseAuth());
    return result.user;
  };

  const signOut = async () => {
    await firebaseSignOut(getFirebaseAuth());
    setChildProfiles([]);
    setActiveChildState(null);
  };

  const deleteAccount = useCallback(async () => {
    const currentUser = getFirebaseAuth().currentUser;
    if (!currentUser) return;
    await deleteUserAccount(currentUser.uid);
    await currentUser.delete();
    // Clear all mfcm_ localStorage keys
    if (typeof window !== "undefined") {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("mfcm_"))
        .forEach((k) => localStorage.removeItem(k));
    }
    setChildProfiles([]);
    setActiveChildState(null);
    setUserSettings(null);
    setUser(null);
  }, []);

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

    // Read from ref to avoid stale closure over activeChild
    const current = activeChildRef.current;
    if (current) {
      const updated = kids.find((k) => k.id === current.id);
      // Update with fresh data, or reset if child was deleted
      setActiveChildState(updated ?? kids[0] ?? null);
    }
  }, [user]);

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        signInAnon,
        signOut,
        deleteAccount,
        children: childProfiles,
        activeChild,
        setActiveChild,
        refreshChildren,
        userSettings,
      }}
    >
      {reactChildren}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
