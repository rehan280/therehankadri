"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function LenisScrollController() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hasCoarsePointer = window.matchMedia("(pointer: coarse)");
    const prefersDesktopViewport = window.matchMedia("(min-width: 1024px)");
    const hasTouchInput = navigator.maxTouchPoints > 0;

    if (
      prefersReducedMotion.matches ||
      hasCoarsePointer.matches ||
      hasTouchInput ||
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
