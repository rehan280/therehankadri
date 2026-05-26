import { NextResponse } from "next/server";
import { getNextApiKey, reportQuotaExceeded } from "@/lib/youtube-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target");

  if (!target) {
    return NextResponse.json({ error: "Missing target URL or handle" }, { status: 400 });
  }

  // Determine if target is an ID or handle
  let id = "";
  let forHandle = "";
  
  if (target.startsWith("UC") && target.length === 24) {
    id = target;
  } else if (target.startsWith("@")) {
    forHandle = target;
  } else {
    // Basic extraction
    if (target.includes("/channel/UC")) {
      id = target.split("/channel/")[1].split("/")[0].split("?")[0];
    } else if (target.includes("/@")) {
      forHandle = "@" + target.split("/@")[1].split("/")[0].split("?")[0];
    } else if (target.includes("/c/") || target.includes("/user/")) {
      // Need to resolve custom url to ID - for simplicity we can try search or just error
      return NextResponse.json({ error: "Please use a channel @handle or UC... ID." }, { status: 400 });
    } else {
      // Maybe they just typed the handle without @
      forHandle = "@" + target;
    }
  }

  try {
    const queryParam = id ? `id=${id}` : `forHandle=${forHandle}`;
    
    let key = getNextApiKey();
    if (!key) {
      return NextResponse.json({ error: "API quota exceeded across all keys, please try again later." }, { status: 429 });
    }
    
    let res: Response;
    let data: any;

    while (key) {
      res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=brandingSettings&${queryParam}&key=${key}`);
      data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.error?.errors?.[0]?.reason === "quotaExceeded") {
          reportQuotaExceeded(key);
          key = getNextApiKey();
          if (!key) break;
          continue; // Try next key
        }
        throw new Error(data.error?.message || "Failed to fetch channel from API");
      }
      break; // Success!
    }

    if (!key) {
      return NextResponse.json({ error: "API quota exceeded across all keys, please try again later." }, { status: 429 });
    }

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Channel not found." }, { status: 404 });
    }

    let bannerUrl = data.items[0]?.brandingSettings?.image?.bannerExternalUrl;
    
    if (!bannerUrl) {
      return NextResponse.json({ error: "This channel does not have a custom banner." }, { status: 404 });
    }

    // Append suffix to get the full-size image, otherwise it may render as a broken image
    bannerUrl += "=w2560";

    return NextResponse.json({ bannerUrl });

  } catch (error: any) {
    console.error("yt-banner-url error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
