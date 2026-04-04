export type TagCategory =
  | "primary"
  | "long-tail"
  | "short-tail"
  | "problem"
  | "semantic"
  | "variation"
  | "trend";

export type TagSource = "yt-serp" | "autocomplete" | "yt-title" | "engineered";

export type GeneratedTag = {
  value: string;
  category: TagCategory;
  source: TagSource;
  score: number;
  isHighPriority: boolean;
};

export type TagGenerationResult = {
  keyword: string;
  intent: string;
  audience: string;
  tags: GeneratedTag[];
  commaSeparated: string;
};

export type YouTubeSerpVideo = {
  videoId: string;
  title: string;
  keywords: string[];
  rank: number;
};

type Candidate = Omit<GeneratedTag, "isHighPriority"> & {
  normalized: string;
  tokenBag: string;
  sourceWeight: number;
  frequency: number;
};

type SuggestionStat = {
  value: string;
  normalized: string;
  frequency: number;
};

type GenerateTagOptions = {
  seed?: number;
  autocompleteSuggestions?: string[];
  serpVideos?: YouTubeSerpVideo[];
};

const CURRENT_YEAR = new Date().getFullYear().toString();

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "best",
  "by",
  "for",
  "from",
  "get",
  "how",
  "in",
  "is",
  "latest",
  "my",
  "new",
  "not",
  "of",
  "on",
  "or",
  "step",
  "the",
  "to",
  "way",
  "with",
  "why",
]);

const GENERIC_SINGLE_WORDS = new Set([
  "channel",
  "content",
  "creator",
  "guide",
  "tips",
  "tutorial",
  "video",
  "videos",
  "youtube",
]);

const CATEGORY_BASE_SCORE: Record<TagCategory, number> = {
  primary: 100,
  "long-tail": 90,
  "short-tail": 82,
  problem: 86,
  semantic: 75,
  variation: 72,
  trend: 74,
};

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function cleanDisplayTag(value: string) {
  return normalizeWhitespace(
    value
      .replace(/[“”"']/g, "")
      .replace(/[|/]+/g, " ")
      .replace(/[_-]+/g, " ")
      .replace(/#/g, "")
  ).replace(/^[,.;:!?()\[\]\s]+|[,.;:!?()\[\]\s]+$/g, "");
}

function normalizeForCompare(value: string) {
  return normalizeWhitespace(
    cleanDisplayTag(value)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
  );
}

function extractMeaningfulTokens(value: string) {
  return normalizeForCompare(value)
    .split(" ")
    .filter((token) => token && !STOP_WORDS.has(token) && token !== CURRENT_YEAR);
}

function buildTokenBag(value: string) {
  return [...new Set(extractMeaningfulTokens(value))].sort().join(" ");
}

function inferIntent(keyword: string) {
  const normalized = normalizeForCompare(keyword);

  if (/\b(compare|vs|versus|review|difference|better)\b/.test(normalized)) {
    return "compare";
  }

  if (/\b(fix|problem|not working|error|issue|stuck|why)\b/.test(normalized)) {
    return "fix";
  }

  if (/\b(grow|increase|boost|gain|scale|get more|viral)\b/.test(normalized)) {
    return "grow";
  }

  if (/\b(best|tips|strategy|optimize|improve)\b/.test(normalized)) {
    return "optimize";
  }

  return "discover";
}

function inferAudience(keyword: string) {
  const normalized = normalizeForCompare(keyword);

  if (/\b(beginner|newbie|start|for beginners)\b/.test(normalized)) {
    return "beginners";
  }

  if (/\b(agency|business|brand|saas|company)\b/.test(normalized)) {
    return "businesses";
  }

  if (/\b(advanced|expert|pro)\b/.test(normalized)) {
    return "advanced users";
  }

  return "creators";
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function overlapsKeyword(tag: string, keyword: string) {
  const tagTokens = extractMeaningfulTokens(tag);
  const keywordTokens = new Set(extractMeaningfulTokens(keyword));

  return tagTokens.some((token) => keywordTokens.has(token));
}

function isLowValueTag(tag: string, keyword: string) {
  const normalized = normalizeForCompare(tag);
  const tokens = normalized.split(" ").filter(Boolean);
  const uniqueTokens = new Set(tokens);

  if (!normalized || normalized.length < 2) {
    return true;
  }

  if (tokens.length === 0 || tokens.length > 8) {
    return true;
  }

  if (tokens.length > 1 && uniqueTokens.size === 1) {
    return true;
  }

  if (/(\b\w+\b)\s+\1/.test(normalized)) {
    return true;
  }

  if (tokens.length === 1 && GENERIC_SINGLE_WORDS.has(tokens[0] ?? "")) {
    return true;
  }

  if (!normalized.includes(normalizeForCompare(keyword)) && !overlapsKeyword(tag, keyword)) {
    return true;
  }

  return false;
}

function detectCategory(tag: string, keyword: string): TagCategory {
  const normalized = normalizeForCompare(tag);
  const tokenCount = extractMeaningfulTokens(tag).length;

  if (normalized === normalizeForCompare(keyword)) {
    return "primary";
  }

  if (/\b(why|fix|problem|problems|mistakes|error|issue|not working)\b/.test(normalized)) {
    return "problem";
  }

  if (new RegExp(`\\b(${CURRENT_YEAR}|latest|new)\\b`).test(normalized)) {
    return "trend";
  }

  if (tokenCount <= 2) {
    return "short-tail";
  }

  if (/\b(how to|tips|tutorial|guide|for beginners|step by step|fast)\b/.test(normalized)) {
    return "long-tail";
  }

  return "semantic";
}

function scoreTag({
  value,
  category,
  source,
  keyword,
  frequency,
  sourceWeight,
}: {
  value: string;
  category: TagCategory;
  source: TagSource;
  keyword: string;
  frequency: number;
  sourceWeight: number;
}) {
  const normalizedValue = normalizeForCompare(value);
  const normalizedKeyword = normalizeForCompare(keyword);
  const words = normalizedValue.split(" ").filter(Boolean);
  const keywordWords = normalizedKeyword.split(" ").filter(Boolean);

  let score = CATEGORY_BASE_SCORE[category] + sourceWeight;

  if (normalizedValue === normalizedKeyword) {
    score += 16;
  } else if (normalizedValue.startsWith(`${normalizedKeyword} `)) {
    score += 10;
  } else if (normalizedValue.includes(normalizedKeyword)) {
    score += 6;
  }

  if (words.length >= 2 && words.length <= 5) {
    score += 4;
  }

  if (words.length === keywordWords.length + 1 || words.length === keywordWords.length + 2) {
    score += 3;
  }

  score += Math.min(14, Math.max(0, frequency - 1) * 3);

  if (source === "yt-serp") {
    score += 4;
  }

  if (source === "autocomplete") {
    score += 2;
  }

  if (value.length > 42) {
    score -= Math.min(16, value.length - 42);
  }

  if (isLowValueTag(value, keyword)) {
    score -= 30;
  }

  return Math.max(35, Math.min(100, Math.round(score)));
}

function addCandidate(
  map: Map<string, Candidate>,
  value: string,
  source: TagSource,
  keyword: string,
  frequency: number,
  sourceWeight: number,
  forcedCategory?: TagCategory
) {
  const cleaned = cleanDisplayTag(value);
  const normalized = normalizeForCompare(cleaned);

  if (!cleaned || isLowValueTag(cleaned, keyword)) {
    return;
  }

  const category = forcedCategory ?? detectCategory(cleaned, keyword);
  const candidate: Candidate = {
    value: cleaned,
    normalized,
    tokenBag: buildTokenBag(cleaned),
    category,
    source,
    frequency,
    sourceWeight,
    score: scoreTag({
      value: cleaned,
      category,
      source,
      keyword,
      frequency,
      sourceWeight,
    }),
  };

  const existing = map.get(normalized);

  if (
    !existing ||
    candidate.score > existing.score ||
    (candidate.score === existing.score && candidate.frequency > existing.frequency)
  ) {
    map.set(normalized, candidate);
  }
}

function sortCandidates(items: Candidate[], seed: number) {
  return [...items].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    if (right.frequency !== left.frequency) {
      return right.frequency - left.frequency;
    }

    const leftHash = hashString(`${left.normalized}:${seed}`) % 1000;
    const rightHash = hashString(`${right.normalized}:${seed}`) % 1000;

    if (leftHash !== rightHash) {
      return rightHash - leftHash;
    }

    return left.value.localeCompare(right.value);
  });
}

function takeFromPool(
  finalTags: Candidate[],
  selectedKeys: Set<string>,
  selectedTokenBags: Set<string>,
  pool: Candidate[],
  count: number
) {
  let remaining = count;

  for (const candidate of pool) {
    if (remaining <= 0) {
      return;
    }

    if (selectedKeys.has(candidate.normalized)) {
      continue;
    }

    if (
      candidate.category !== "primary" &&
      candidate.tokenBag &&
      selectedTokenBags.has(candidate.tokenBag)
    ) {
      continue;
    }

    finalTags.push(candidate);
    selectedKeys.add(candidate.normalized);

    if (candidate.tokenBag) {
      selectedTokenBags.add(candidate.tokenBag);
    }

    remaining -= 1;
  }
}

function buildSuggestionStats(keyword: string, suggestions: string[]) {
  const stats = new Map<string, SuggestionStat>();

  for (const suggestion of suggestions) {
    const cleaned = cleanDisplayTag(suggestion);
    const normalized = normalizeForCompare(cleaned);

    if (!cleaned || isLowValueTag(cleaned, keyword)) {
      continue;
    }

    const existing = stats.get(normalized);

    if (existing) {
      existing.frequency += 1;
      continue;
    }

    stats.set(normalized, {
      value: cleaned,
      normalized,
      frequency: 1,
    });
  }

  return [...stats.values()];
}

function collectTitlePhrases(title: string, keyword: string) {
  const cleanedTitle = cleanDisplayTag(title);
  const titleTokens = extractMeaningfulTokens(cleanedTitle);
  const keywordTokens = new Set(extractMeaningfulTokens(keyword));
  const phrases = new Set<string>();

  for (let size = 2; size <= 4; size += 1) {
    for (let index = 0; index <= titleTokens.length - size; index += 1) {
      const phraseTokens = titleTokens.slice(index, index + size);
      const phrase = phraseTokens.join(" ");

      if (!phraseTokens.some((token) => keywordTokens.has(token))) {
        continue;
      }

      if (phrase.length >= 4) {
        phrases.add(phrase);
      }
    }
  }

  return [...phrases];
}

export function generateYouTubeTags(
  keyword: string,
  options: GenerateTagOptions = {}
): TagGenerationResult {
  const cleanedKeyword = cleanDisplayTag(keyword);
  const seed = options.seed ?? 0;
  const autocompleteSuggestions = options.autocompleteSuggestions ?? [];
  const serpVideos = options.serpVideos ?? [];

  if (!cleanedKeyword) {
    throw new Error("Enter a main keyword to generate tags.");
  }

  const primaryMap = new Map<string, Candidate>();
  const longTailMap = new Map<string, Candidate>();
  const shortTailMap = new Map<string, Candidate>();
  const problemMap = new Map<string, Candidate>();
  const semanticMap = new Map<string, Candidate>();
  const variationMap = new Map<string, Candidate>();
  const trendMap = new Map<string, Candidate>();

  const categoryMaps: Record<TagCategory, Map<string, Candidate>> = {
    primary: primaryMap,
    "long-tail": longTailMap,
    "short-tail": shortTailMap,
    problem: problemMap,
    semantic: semanticMap,
    variation: variationMap,
    trend: trendMap,
  };

  addCandidate(primaryMap, cleanedKeyword, "engineered", cleanedKeyword, 1, 0, "primary");

  const suggestionStats = buildSuggestionStats(cleanedKeyword, autocompleteSuggestions);

  for (const stat of suggestionStats) {
    const category = detectCategory(stat.value, cleanedKeyword);
    addCandidate(
      categoryMaps[category],
      stat.value,
      "autocomplete",
      cleanedKeyword,
      stat.frequency,
      9,
      category
    );
  }

  for (const video of serpVideos) {
    const rankWeight = Math.max(1, 12 - video.rank * 2);

    for (const tag of video.keywords) {
      const category = detectCategory(tag, cleanedKeyword);
      addCandidate(
        categoryMaps[category],
        tag,
        "yt-serp",
        cleanedKeyword,
        1,
        rankWeight,
        category
      );
    }

    for (const phrase of collectTitlePhrases(video.title, cleanedKeyword)) {
      const category = detectCategory(phrase, cleanedKeyword);
      addCandidate(
        categoryMaps[category],
        phrase,
        "yt-title",
        cleanedKeyword,
        1,
        Math.max(1, rankWeight - 4),
        category
      );
    }
  }

  const finalTags: Candidate[] = [];
  const selectedKeys = new Set<string>();
  const selectedTokenBags = new Set<string>();

  takeFromPool(finalTags, selectedKeys, selectedTokenBags, sortCandidates([...primaryMap.values()], seed), 2);
  takeFromPool(finalTags, selectedKeys, selectedTokenBags, sortCandidates([...longTailMap.values()], seed), 6);
  takeFromPool(finalTags, selectedKeys, selectedTokenBags, sortCandidates([...shortTailMap.values()], seed), 4);
  takeFromPool(finalTags, selectedKeys, selectedTokenBags, sortCandidates([...problemMap.values()], seed), 2);
  takeFromPool(finalTags, selectedKeys, selectedTokenBags, sortCandidates([...semanticMap.values()], seed), 3);
  takeFromPool(finalTags, selectedKeys, selectedTokenBags, sortCandidates([...variationMap.values()], seed), 0);
  takeFromPool(finalTags, selectedKeys, selectedTokenBags, sortCandidates([...trendMap.values()], seed), 1);

  if (finalTags.length < 15) {
    const leftovers = sortCandidates(
      [
        ...primaryMap.values(),
        ...longTailMap.values(),
        ...shortTailMap.values(),
        ...problemMap.values(),
        ...semanticMap.values(),
        ...trendMap.values(),
      ].filter((candidate) => !selectedKeys.has(candidate.normalized)),
      seed
    );

    takeFromPool(
      finalTags,
      selectedKeys,
      selectedTokenBags,
      leftovers,
      20 - finalTags.length
    );
  }

  const limitedTags: GeneratedTag[] = [];
  let characterCount = 0;

  for (const [index, tag] of finalTags.slice(0, 20).entries()) {
    const nextLength =
      limitedTags.length === 0
        ? tag.value.length
        : characterCount + 2 + tag.value.length;

    if (nextLength > 500) {
      continue;
    }

    limitedTags.push({
      value: tag.value,
      category: tag.category,
      source: tag.source,
      score: tag.score,
      isHighPriority: index < 5,
    });
    characterCount = nextLength;
  }

  return {
    keyword: cleanedKeyword,
    intent: inferIntent(cleanedKeyword),
    audience: inferAudience(cleanedKeyword),
    tags: limitedTags,
    commaSeparated: limitedTags.map((tag) => tag.value).join(", "),
  };
}
