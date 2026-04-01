import type { NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function buildRedirectUrl(request: NextRequest, params?: Record<string, string>) {
  const nextPath = request.nextUrl.searchParams.get("next") || "/admin/jsx-upload";
  const redirectUrl = new URL(nextPath, request.url);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    redirectUrl.searchParams.set(key, value);
  });

  return redirectUrl;
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    return NextResponse.redirect(
      buildRedirectUrl(
        request,
        error
          ? {
              type: "error",
              message: error.message,
            }
          : {
              type: "success",
              message: "You are now signed in to the blog CMS.",
            }
      )
    );
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });

    return NextResponse.redirect(
      buildRedirectUrl(
        request,
        error
          ? {
              type: "error",
              message: error.message,
            }
          : {
              type: "success",
              message: "You are now signed in to the blog CMS.",
            }
      )
    );
  }

  return NextResponse.redirect(
    buildRedirectUrl(request, {
      type: "error",
      message: "The Supabase login callback was missing its verification code.",
    })
  );
}

