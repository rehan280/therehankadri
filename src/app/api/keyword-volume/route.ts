import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FreeVolumeResult = {
  keyword: string;
  source: "youtube_autocomplete";
  volumeScore: number;
  uniqueSuggestions: number;
  exactSuggestionMatches: number;
  bestAutocompleteRank: number | null;
  expansionMatches: number;
  questionMatches: number;
  topSuggestions: string[];
};

const EXPANSION_PROBES = ["", " a", " b", " c", " d", " e", " f", " g", " h", " how", " best", " for"];

function normalizeKeyword(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
}

function includesKeywordTokens(suggestion: string, keyword: string) {
  const suggestionTokens = new Set(normalizeKeyword(suggestion).split(" ").filter(Boolean));
  const keywordTokens = normalizeKeyword(keyword).split(" ").filter(Boolean);
  if (!keywordTokens.length) return false;
  const matches = keywordTokens.filter(token => suggestionTokens.has(token)).length;
  return matches / keywordTokens.length >= 0.65;
}

async function fetchYouTubeSuggestions(query: string) {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) && Array.isArray(data[1])
      ? data[1].map((item: unknown) => String(item)).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

async function scoreKeyword(keyword: string): Promise<FreeVolumeResult> {
  const cleanKeyword = normalizeKeyword(keyword);
  const groups = await Promise.all(EXPANSION_PROBES.map(probe => fetchYouTubeSuggestions(`${cleanKeyword}${probe}`)));
  const baseSuggestions = groups[0] || [];
  const allSuggestions = [...new Set(groups.flat().map(normalizeKeyword).filter(Boolean))];
  const relevantSuggestions = allSuggestions.filter(suggestion => includesKeywordTokens(suggestion, cleanKeyword));
  const exactSuggestionMatches = relevantSuggestions.filter(suggestion => suggestion.includes(cleanKeyword)).length;
  const questionMatches = relevantSuggestions.filter(suggestion => /^(how|what|why|when|where|can|should|does|is)\b/.test(suggestion)).length;
  const bestAutocompleteRankRaw = baseSuggestions.findIndex(suggestion => normalizeKeyword(suggestion) === cleanKeyword || normalizeKeyword(suggestion).includes(cleanKeyword));
  const bestAutocompleteRank = bestAutocompleteRankRaw >= 0 ? bestAutocompleteRankRaw + 1 : null;
  const expansionMatches = groups.slice(1).filter(group => group.some(suggestion => includesKeywordTokens(suggestion, cleanKeyword))).length;

  const coverageScore = Math.min(100, relevantSuggestions.length * 5);
  const exactScore = Math.min(100, exactSuggestionMatches * 9);
  const rankScore = bestAutocompleteRank ? Math.max(20, 110 - bestAutocompleteRank * 10) : 0;
  const expansionScore = Math.min(100, expansionMatches * 10);
  const questionScore = Math.min(100, questionMatches * 8);
  const volumeScore = Math.round(
    coverageScore * 0.34 +
    exactScore * 0.22 +
    rankScore * 0.2 +
    expansionScore * 0.16 +
    questionScore * 0.08
  );

  return {
    keyword: cleanKeyword,
    source: "youtube_autocomplete",
    volumeScore,
    uniqueSuggestions: relevantSuggestions.length,
    exactSuggestionMatches,
    bestAutocompleteRank,
    expansionMatches,
    questionMatches,
    topSuggestions: relevantSuggestions.slice(0, 8),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const keywords: string[] = Array.isArray(body.keywords)
      ? [...new Set(body.keywords.map((keyword: unknown) => normalizeKeyword(String(keyword))).filter(Boolean) as string[])].slice(0, 25)
      : [];

    if (!keywords.length) {
      return NextResponse.json({ source: "youtube_autocomplete", results: [] });
    }

    const results = await Promise.all(keywords.map((kw: string) => scoreKeyword(kw)));
    return NextResponse.json({ source: "youtube_autocomplete", results });
  } catch (error) {
    return NextResponse.json({
      source: "youtube_autocomplete",
      results: [],
      error: error instanceof Error ? error.message : "Unable to calculate free keyword volume signals.",
    }, { status: 500 });
  }
}
