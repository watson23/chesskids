"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Pikku from "@/components/Pikku";

export default function LoginPage() {
  const { user, loading, signIn, signInAnon } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) router.replace("/");
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center gap-6 px-8"
      style={{
        background: "linear-gradient(170deg, #E0E7FF 0%, #F5F0FF 40%, #FFF0F5 100%)",
      }}
    >
      {/* Pikku mascot — the Chess Penguin */}
      <div className="animate-float">
        <Pikku expression="happy" size={110} />
      </div>

      <h1
        className="text-4xl font-extrabold tracking-tight"
        style={{ color: "var(--ck-text)" }}
      >
        Chess Penguin
      </h1>

      <p className="text-base font-medium" style={{ color: "var(--ck-text-light)" }}>
        Chess for kids — no reading needed!
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
        <button
          onClick={signIn}
          className="card-pillow flex items-center justify-center gap-3 px-6 py-4 text-lg font-bold transition-all active:scale-95"
          style={{ color: "var(--ck-text)" }}
        >
          Sign in with Google
        </button>

        <button
          onClick={signInAnon}
          className="btn-3d btn-3d-purple w-full text-center"
        >
          Try without account
        </button>
      </div>
    </div>
  );
}
