// src/lib/youtube-keys.ts - HMR flushed cache again
export const YOUTUBE_KEYS = [
  process.env.YOUTUBE_DATA_API_KEY,
  process.env.YOUTUBE_DATA_API_KEY_2,
  process.env.YOUTUBE_DATA_API_KEY_3,
  process.env.YOUTUBE_DATA_API_KEY_4,
  process.env.YOUTUBE_DATA_API_KEY_5,
  process.env.YOUTUBE_DATA_API_KEY_6,
  process.env.YOUTUBE_DATA_API_KEY_7,
].filter(Boolean) as string[];

let currentKeyIndex = 0;
const exhaustedKeys = new Set<string>();

export function getNextApiKey(): string | null {
  for (let i = 0; i < YOUTUBE_KEYS.length; i++) {
    const key = YOUTUBE_KEYS[(currentKeyIndex + i) % YOUTUBE_KEYS.length];
    if (!exhaustedKeys.has(key)) {
      currentKeyIndex = (currentKeyIndex + i) % YOUTUBE_KEYS.length;
      return key;
    }
  }
  return null; // All keys exhausted
}

export function reportQuotaExceeded(key: string) {
  exhaustedKeys.add(key);
  console.warn(`[API KEY EXHAUSTED] Key ending in ...${key.slice(-4)} has run out of quota.`);
}
