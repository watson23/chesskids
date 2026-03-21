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
  const { user, loading, signInAnon } = useAuth();
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    if (user && !loading) router.replace("/");
  }, [user, loading, router]);

  const handlePlayFree = useCallback(async () => {
    await signInAnon();
  }, [signInAnon]);

  // Override body overflow-hidden from root layout so landing page can scroll
  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (loading) return null;

  return (
    <div>
      <HeroSection t={t} onPlayFree={handlePlayFree} />
      <FeaturesSection t={t} />
      <TrustSection t={t} />
      <CTASection t={t} onPlayFree={handlePlayFree} />
    </div>
  );
}
