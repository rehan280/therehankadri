"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const PREFETCH_TIMEOUT_MS = 2000;

type BrowserWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

type NetworkConnection = {
  effectiveType?: string;
  saveData?: boolean;
};

const getWarmRoutes = (pathname: string) => {
  if (pathname === "/contact") {
    return ["/", "/blog"];
  }

  if (
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === "/stats/youtube" ||
    pathname === "/stats/youtube/channel" ||
    pathname.startsWith("/stats/")
  ) {
    return ["/", "/contact"];
  }

  return ["/blog", "/stats/youtube/channel", "/contact"];
};

export default function RouteWarmup() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkConnection }).connection;

    if (connection?.saveData || connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g") {
      return;
    }

    const warmRoutes = getWarmRoutes(pathname);
    const browserWindow = window as BrowserWindow;
    const prefetchRoutes = () => {
      warmRoutes.forEach((href) => {
        router.prefetch(href);
      });
    };

    if (browserWindow.requestIdleCallback) {
      const idleHandle = browserWindow.requestIdleCallback(prefetchRoutes, {
        timeout: PREFETCH_TIMEOUT_MS,
      });

      return () => {
        browserWindow.cancelIdleCallback?.(idleHandle);
      };
    }

    const timeoutHandle = window.setTimeout(prefetchRoutes, PREFETCH_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutHandle);
    };
  }, [pathname, router]);

  return null;
}
