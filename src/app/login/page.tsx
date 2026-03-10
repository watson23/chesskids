"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";
import { useLocale } from "@/hooks/useLocale";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TrustSection from "@/components/landing/TrustSection";
import CTASection from "@/components/landing/CTASection";

export default function LoginPage() {
  const { user, loading, signIn, signInAnon } = useAuth();
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    if (user && !loading) router.replace("/");
  }, [user, loading, router]);

  const handlePlayFree = useCallback(async () => {
    await signInAnon();
  }, [signInAnon]);

  const handleGoogleSignIn = useCallback(async () => {
    await signIn();
  }, [signIn]);

  if (loading) return null;

  return (
    <div className="min-h-dvh overflow-x-hidden">
      <HeroSection t={t} onPlayFree={handlePlayFree} onGoogleSignIn={handleGoogleSignIn} />
      <FeaturesSection t={t} />
      <TrustSection t={t} />
      <CTASection t={t} onPlayFree={handlePlayFree} onGoogleSignIn={handleGoogleSignIn} />
    </div>
  );
}
