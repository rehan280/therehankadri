"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const IDLE_TIMEOUT_MS = 1500;

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
  const pathname = usePathname();
  const [enableDeferredFeatures, setEnableDeferredFeatures] = useState(false);
  const [enableCmsGuard, setEnableCmsGuard] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
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
  }, [pathname]);

  useEffect(() => {
    const browserWindow = window as BrowserWindow;

    const enableFeatures = () => {
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

    if (document.readyState === "complete") {
      return enableFeatures();
    }

    let cleanup: (() => void) | undefined;
    const handleLoad = () => {
      cleanup = enableFeatures();
    };

    window.addEventListener("load", handleLoad, { once: true });

    return () => {
      window.removeEventListener("load", handleLoad);
      cleanup?.();
    };
  }, []);

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
