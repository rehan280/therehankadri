"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitToolRating(slug: string, stars: number) {
  if (stars < 1 || stars > 5) {
    return { success: false, error: "Invalid rating" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    
    // In Supabase, we can use an RPC (Remote Procedure Call) to increment securely,
    // or we can just fetch and update. Since this isn't a massive high-traffic financial app,
    // a simple fetch -> update is fine, but RPC is better.
    // Assuming no RPC for now, we will do a simple read/write transaction.
    
    const { data: existing } = await supabase
      .from("tool_ratings")
      .select("total_stars, rating_count")
      .eq("tool_slug", slug)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("tool_ratings")
        .update({
          total_stars: existing.total_stars + stars,
          rating_count: existing.rating_count + 1,
        })
        .eq("tool_slug", slug);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("tool_ratings")
        .insert({
          tool_slug: slug,
          total_stars: stars,
          rating_count: 1,
        });

      if (error) throw error;
    }

    // Revalidate the route so the new schema is generated on the next load
    revalidatePath(`/${slug}`);
    revalidatePath(`/tools`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error submitting rating:", error);
    return { success: false, error: error.message };
  }
}
