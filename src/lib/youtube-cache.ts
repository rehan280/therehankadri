import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const supabase = createSupabaseAdminClient();

export async function getCachedData<T>(cacheKey: string): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from("youtube_cache")
      .select("data, expires_at")
      .eq("cache_key", cacheKey)
      .single();

    if (error || !data) {
      return null;
    }

    const isExpired = new Date(data.expires_at).getTime() < Date.now();
    if (isExpired) {
      // Background delete expired record
      supabase.from("youtube_cache").delete().eq("cache_key", cacheKey).then();
      return null;
    }

    return data.data as T;
  } catch (err) {
    console.error("Cache Read Error:", err);
    return null;
  }
}

export async function setCachedData(cacheKey: string, data: any, ttlSeconds: number): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    
    await supabase.from("youtube_cache").upsert(
      {
        cache_key: cacheKey,
        data,
        expires_at: expiresAt,
      },
      { onConflict: "cache_key" }
    );
  } catch (err) {
    console.error("Cache Write Error:", err);
  }
}

export async function logApiMetric({
  toolSlug,
  endpoint,
  statusCode,
  isCached,
  latencyMs,
}: {
  toolSlug: string;
  endpoint: string;
  statusCode: number;
  isCached: boolean;
  latencyMs: number;
}) {
  try {
    await supabase.from("api_metrics").insert({
      tool_slug: toolSlug,
      endpoint,
      status_code: statusCode,
      is_cached: isCached,
      latency_ms: latencyMs,
    });
  } catch (err) {
    console.error("Metric Log Error:", err);
  }
}
