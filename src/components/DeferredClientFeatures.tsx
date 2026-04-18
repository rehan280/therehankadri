"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const IDLE_TIMEOUT_MS = 10_000;

type BrowserWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

const DeferredAnalytics = dynamic(
  () => import("@vercel/analytics/react").then((mod) => mod.Analytics),
  { ssr: false }
);
const DeferredSpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  { ssr: false }
);
const DeferredCmsMagicLinkRedirectGuard = dynamic(
  () => import("./cms/CmsMagicLinkRedirectGuard"),
  { ssr: false }
);

function hasCmsRedirectParams(url: URL) {
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));

  return Boolean(
    url.searchParams.get("code") ||
      url.searchParams.get("token_hash") ||
      url.searchParams.get("error") ||
      hashParams.get("error") ||
      hashParams.get("access_token") ||
      hashParams.get("refresh_token")
  );
}

export default function DeferredClientFeatures() {
  const [enableDeferredFeatures, setEnableDeferredFeatures] = useState(false);
  const [enableCmsGuard, setEnableCmsGuard] = useState(false);

  useEffect(() => {
    const isHomepage = window.location.pathname === "/";

    if (!isHomepage) {
      setEnableCmsGuard(false);
      return;
    }

    const updateCmsGuard = () => {
      setEnableCmsGuard(hasCmsRedirectParams(new URL(window.location.href)));
    };

    updateCmsGuard();
    window.addEventListener("hashchange", updateCmsGuard);
    window.addEventListener("popstate", updateCmsGuard);

    return () => {
      window.removeEventListener("hashchange", updateCmsGuard);
      window.removeEventListener("popstate", updateCmsGuard);
    };
  }, []);

  useEffect(() => {
    const browserWindow = window as BrowserWindow;
    let cleanup: (() => void) | undefined;

    const enableFeatures = () => {
      if (enableDeferredFeatures) {
        return;
      }

      if (browserWindow.requestIdleCallback) {
        const idleHandle = browserWindow.requestIdleCallback(
          () => {
            setEnableDeferredFeatures(true);
          },
          { timeout: IDLE_TIMEOUT_MS }
        );

        return () => {
          browserWindow.cancelIdleCallback?.(idleHandle);
        };
      }

      const timeoutHandle = window.setTimeout(() => {
        setEnableDeferredFeatures(true);
      }, IDLE_TIMEOUT_MS);

      return () => {
        window.clearTimeout(timeoutHandle);
      };
    };

    const scheduleEnable = () => {
      cleanup?.();
      cleanup = enableFeatures();
    };

    const handleFirstInteraction = () => {
      scheduleEnable();
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("scroll", handleFirstInteraction);
    };

    if (document.readyState === "complete") {
      scheduleEnable();
    } else {
      const handleLoad = () => {
        scheduleEnable();
      };

      window.addEventListener("load", handleLoad, { once: true });

      cleanup = () => {
        window.removeEventListener("load", handleLoad);
      };
    }

    window.addEventListener("pointerdown", handleFirstInteraction, { once: true, passive: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true, passive: true });
    window.addEventListener("scroll", handleFirstInteraction, { once: true, passive: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("scroll", handleFirstInteraction);
      cleanup?.();
    };
  }, [enableDeferredFeatures]);

  return (
    <>
      {enableCmsGuard ? <DeferredCmsMagicLinkRedirectGuard /> : null}
      {enableDeferredFeatures ? (
        <>
          <DeferredAnalytics />
          <DeferredSpeedInsights />
        </>
      ) : null}
    </>
  );
}
