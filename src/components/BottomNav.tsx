"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { MapTrifold, PuzzlePiece, Sword } from "@phosphor-icons/react";
import { useAudio } from "@/hooks/useAudio";

const NAV_PAGES = ["/", "/practice", "/play"];

interface NavItem {
  path: string;
  icon: typeof MapTrifold;
  label: string;
  activeColor: string;
  activeBg: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: "/", icon: MapTrifold, label: "Learn", activeColor: "#B197FC", activeBg: "#B197FC" },
  { path: "/practice", icon: PuzzlePiece, label: "Practice", activeColor: "#93C5FD", activeBg: "#93C5FD" },
  { path: "/play", icon: Sword, label: "Play", activeColor: "#FDA4AF", activeBg: "#FDA4AF" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { sfx } = useAudio();

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
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around pb-[env(safe-area-inset-bottom)]"
      style={{
        height: "calc(68px + env(safe-area-inset-bottom))",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        borderTop: "2.5px solid var(--ck-border)",
      }}
    >
      {NAV_ITEMS.map(({ path, icon: Icon, label, activeColor, activeBg }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex flex-col items-center justify-center gap-1 px-6 py-2 transition-all"
            aria-label={label}
            aria-current={active ? "page" : undefined}
          >
            <div
              className="flex items-center justify-center rounded-full transition-all"
              style={{
                width: active ? 52 : 40,
                height: active ? 34 : 32,
                background: active ? activeBg : "transparent",
              }}
            >
              <Icon
                size={24}
                weight={active ? "fill" : "regular"}
                color={active ? "white" : "#B8B0C8"}
              />
            </div>
            <span
              className="text-[11px] font-bold leading-none"
              style={{ color: active ? activeColor : "#B8B0C8" }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
