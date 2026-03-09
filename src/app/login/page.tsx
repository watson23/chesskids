"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) router.replace("/");
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-amber-50 gap-8 px-8">
      <div className="text-8xl">&#9822;</div>
      <h1 className="text-3xl font-bold text-amber-900">ChessKids</h1>
      <button
        onClick={signIn}
        className="flex items-center gap-3 bg-white rounded-xl px-6 py-4 shadow-md hover:shadow-lg transition-shadow text-lg font-semibold text-gray-700"
      >
        Sign in with Google
      </button>
    </div>
  );
}
