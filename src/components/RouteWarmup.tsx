"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const getWarmRoutes = (pathname: string) => {
  if (pathname === "/contact") {
    return ["/", "/blog"];
  }

  if (pathname === "/blog" || pathname.startsWith("/blog/")) {
    return ["/", "/contact"];
  }

  return ["/blog", "/contact"];
};

export default function RouteWarmup() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const warmRoutes = getWarmRoutes(pathname);

    warmRoutes.forEach((href) => {
      router.prefetch(href);
    });
  }, [pathname, router]);

  return null;
}
