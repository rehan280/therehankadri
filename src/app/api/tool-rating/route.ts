import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getFallbackRating } from "@/lib/tool-ratings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/tool-rating?slug=youtube-monetization-checker
// Returns the current live rating from Supabase, bypassing any page cache.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("tool_ratings")
      .select("total_stars, rating_count")
      .eq("tool_slug", slug)
      .single();

    if (!error && data && data.rating_count > 0) {
      const average = Math.round((data.total_stars / data.rating_count) * 10) / 10;
      return NextResponse.json({ average, count: data.rating_count });
    }
  } catch {
    // Fall through to fallback
  }

  const fallback = getFallbackRating(slug);
  return NextResponse.json({ average: fallback.average, count: fallback.count });
}

// POST /api/tool-rating
// Body: { slug: string, stars: number }
// Submits a new rating and returns the updated values.
export async function POST(request: Request) {
  let slug = "";
  let stars = 0;

  try {
    const body = await request.json();
    slug = (body.slug ?? "").trim();
    stars = Number(body.stars);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  if (stars < 1 || stars > 5) {
    return NextResponse.json({ error: "stars must be between 1 and 5" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();

    const { data: existing } = await supabase
      .from("tool_ratings")
      .select("total_stars, rating_count")
      .eq("tool_slug", slug)
      .single();

    let newTotalStars: number;
    let newCount: number;

    if (existing) {
      newTotalStars = existing.total_stars + stars;
      newCount = existing.rating_count + 1;

      const { error } = await supabase
        .from("tool_ratings")
        .update({ total_stars: newTotalStars, rating_count: newCount })
        .eq("tool_slug", slug);

      if (error) throw error;
    } else {
      const fallback = getFallbackRating(slug);
      newTotalStars = Math.round(fallback.average * fallback.count) + stars;
      newCount = fallback.count + 1;

      const { error } = await supabase
        .from("tool_ratings")
        .insert({ tool_slug: slug, total_stars: newTotalStars, rating_count: newCount });

      if (error) throw error;
    }

    const average = Math.round((newTotalStars / newCount) * 10) / 10;
    return NextResponse.json({ success: true, average, count: newCount });
  } catch (err: any) {
    console.error("Error saving rating:", err);
    return NextResponse.json({ error: err.message ?? "Failed to save rating" }, { status: 500 });
  }
}
