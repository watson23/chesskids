"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import type { ChildProfile } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<User | null>;
  signOut: () => Promise<void>;
  children: ChildProfile[];
  activeChild: ChildProfile | null;
  setActiveChild: (child: ChildProfile) => void;
  refreshChildren: () => Promise<void>;
}

const AuthCtx = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => null,
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
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (): Promise<User | null> => {
    const result = await signInWithPopup(getFirebaseAuth(), googleProvider);
    return result.user;
  };

  const signOut = async () => {
    await firebaseSignOut(getFirebaseAuth());
    setChildProfiles([]);
    setActiveChild(null);
  };

  const refreshChildren = async () => {
    // TODO: Fetch from Firestore in Task 11
  };

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        signIn,
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
