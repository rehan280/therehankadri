"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function LenisScrollController() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersPrecisePointer = window.matchMedia("(pointer: fine)");
    const prefersDesktopViewport = window.matchMedia("(min-width: 1024px)");

    if (
      prefersReducedMotion.matches ||
      !prefersPrecisePointer.matches ||
      !prefersDesktopViewport.matches
    ) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      autoToggle: true,
      smoothWheel: true,
      syncTouch: false,
      stopInertiaOnNavigate: true,
      lerp: 0.075,
      wheelMultiplier: 0.82,
      touchMultiplier: 1,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
