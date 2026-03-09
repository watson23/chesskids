"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { MapTrifold, PuzzlePiece, Sword } from "@phosphor-icons/react";
import { useAudio } from "@/hooks/useAudio";

/** Pages where the bottom nav should be visible (exact match). */
const NAV_PAGES = ["/", "/practice", "/play"];

interface NavItem {
  path: string;
  icon: typeof MapTrifold;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: "/", icon: MapTrifold, label: "Learn" },
  { path: "/practice", icon: PuzzlePiece, label: "Practice" },
  { path: "/play", icon: Sword, label: "Play" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { sfx } = useAudio();

  // Only show on top-level pages
  if (!NAV_PAGES.includes(pathname)) return null;

  return <BottomNavInner pathname={pathname} router={router} sfx={sfx} />;
}

function BottomNavInner({
  pathname,
  router,
  sfx,
}: {
  pathname: string;
  router: ReturnType<typeof useRouter>;
  sfx: ReturnType<typeof useAudio>["sfx"];
}) {
  const navigate = useCallback(
    (path: string) => {
      if (path === pathname) return;
      sfx("button-tap");
      router.push(path);
    },
    [pathname, router, sfx]
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around bg-white/90 backdrop-blur border-t border-amber-100 pb-[env(safe-area-inset-bottom)]"
      style={{ height: "calc(56px + env(safe-area-inset-bottom))" }}
    >
      {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center gap-0.5 px-6 py-2 transition-colors ${
              active ? "text-amber-600" : "text-gray-400"
            }`}
            aria-label={label}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              size={28}
              weight={active ? "fill" : "regular"}
            />
            <span className="text-[10px] font-semibold leading-none">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
