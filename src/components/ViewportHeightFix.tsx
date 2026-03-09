"use client";

import { useEffect } from "react";

export default function ViewportHeightFix() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function updateHeight() {
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${height}px`);
    }

    updateHeight();
    vv.addEventListener("resize", updateHeight);
    vv.addEventListener("scroll", updateHeight);
    return () => {
      vv.removeEventListener("resize", updateHeight);
      vv.removeEventListener("scroll", updateHeight);
    };
  }, []);

  return null;
}
