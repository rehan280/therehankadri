"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const CMS_DASHBOARD_PATH = "/admin/jsx-upload";
const CMS_CALLBACK_PATH = `${CMS_DASHBOARD_PATH}/auth/callback`;

function buildAdminRedirect(params?: Record<string, string>) {
  const redirectUrl = new URL(CMS_DASHBOARD_PATH, window.location.origin);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      redirectUrl.searchParams.set(key, value);
    }
  });

  return redirectUrl.toString();
}

export default function CmsMagicLinkRedirectGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const currentUrl = new URL(window.location.href);
    const hashParams = new URLSearchParams(currentUrl.hash.replace(/^#/, ""));
    const searchParams = currentUrl.searchParams;
    const authError = searchParams.get("error") ?? hashParams.get("error");
    const authErrorDescription =
      searchParams.get("error_description") ?? hashParams.get("error_description");
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const authType = searchParams.get("type");

    if (code || (tokenHash && authType)) {
      const callbackUrl = new URL(CMS_CALLBACK_PATH, currentUrl.origin);
      callbackUrl.search = searchParams.toString();

      if (!callbackUrl.searchParams.get("next")) {
        callbackUrl.searchParams.set("next", CMS_DASHBOARD_PATH);
      }

      window.location.replace(callbackUrl.toString());
      return;
    }

    if (authError) {
      window.location.replace(
        buildAdminRedirect({
          type: "error",
          message: authErrorDescription
            ? decodeURIComponent(authErrorDescription.replace(/\+/g, " "))
            : "The magic link could not be completed. Request a fresh login link.",
        })
      );
      return;
    }

    if (hashParams.get("access_token") || hashParams.get("refresh_token")) {
      window.location.replace(
        buildAdminRedirect({
          type: "error",
          message:
            "This magic link landed on the homepage instead of the CMS callback. Request a fresh link from the CMS login page.",
        })
      );
    }
  }, [pathname]);

  return null;
}
