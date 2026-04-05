import "server-only";

import { unstable_cache } from "next/cache";

export type ShareNetwork = "x" | "facebook" | "reddit" | "linkedin";
export type VerifiedNetwork = "x" | "linkedin";

type ShareLink = {
  href: string;
  label: string;
  network: ShareNetwork;
};

type VerifiedShareSource = {
  linkedin?: {
    organizationUrn: string;
    shareUrns: string[];
  };
  x?: {
    tweetIds: string[];
  };
};

type XTweetLookupResponse = {
  data?: Array<{
    id: string;
    public_metrics?: {
      quote_count?: number;
      retweet_count?: number;
    };
  }>;
};

type LinkedInShareStatisticsResponse = {
  elements?: Array<{
    share?: string;
    totalShareStatistics?: {
      shareCount?: number;
    };
  }>;
};

export type VerifiedShareSnapshot = {
  message: string;
  networks: Array<{
    count: number;
    network: VerifiedNetwork;
  }>;
  status: "needs_setup" | "unavailable" | "verified";
  total: number | null;
};

// Add article-specific source post IDs here when you want the UI to surface
// API-backed counts. Only real network shares/reposts from these connected
// posts are counted. Button clicks are never counted.
const VERIFIED_SHARE_SOURCES: Record<string, VerifiedShareSource> = {};

function buildXShareLink(title: string, url: string) {
  const params = new URLSearchParams({
    text: title,
    url,
  });

  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

function buildFacebookShareLink(url: string) {
  const params = new URLSearchParams({
    u: url,
  });

  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

function buildRedditShareLink(title: string, url: string) {
  const params = new URLSearchParams({
    title,
    url,
  });

  return `https://www.reddit.com/submit?${params.toString()}`;
}

function buildLinkedInShareLink(url: string) {
  const params = new URLSearchParams({
    url,
  });

  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

export function getArticleShareLinks(title: string, url: string): ShareLink[] {
  return [
    {
      href: buildXShareLink(title, url),
      label: "Share on X",
      network: "x",
    },
    {
      href: buildFacebookShareLink(url),
      label: "Share on Facebook",
      network: "facebook",
    },
    {
      href: buildRedditShareLink(title, url),
      label: "Share on Reddit",
      network: "reddit",
    },
    {
      href: buildLinkedInShareLink(url),
      label: "Share on LinkedIn",
      network: "linkedin",
    },
  ];
}

export function hasVerifiedShareSources(slug: string) {
  const source = VERIFIED_SHARE_SOURCES[slug];

  return Boolean(source?.x?.tweetIds.length || source?.linkedin?.shareUrns.length);
}

async function fetchXVerifiedShareCount(tweetIds: string[]) {
  const token = process.env.X_BEARER_TOKEN;

  if (!token || !tweetIds.length) {
    return null;
  }

  const requestUrl = new URL("https://api.x.com/2/tweets");
  requestUrl.searchParams.set("ids", tweetIds.join(","));
  requestUrl.searchParams.set("tweet.fields", "public_metrics");

  try {
    const response = await fetch(requestUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as XTweetLookupResponse;

    return (payload.data ?? []).reduce((total, tweet) => {
      const metrics = tweet.public_metrics;

      return total + (metrics?.retweet_count ?? 0) + (metrics?.quote_count ?? 0);
    }, 0);
  } catch {
    return null;
  }
}

async function fetchLinkedInVerifiedShareCount(
  source: NonNullable<VerifiedShareSource["linkedin"]>
) {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const apiVersion = process.env.LINKEDIN_API_VERSION;

  if (!token || !apiVersion || !source.shareUrns.length) {
    return null;
  }

  const requestUrl = new URL(
    "https://api.linkedin.com/rest/organizationalEntityShareStatistics"
  );
  requestUrl.searchParams.set("q", "organizationalEntity");
  requestUrl.searchParams.set("organizationalEntity", source.organizationUrn);
  requestUrl.searchParams.set("shares", `List(${source.shareUrns.join(",")})`);

  try {
    const response = await fetch(requestUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Linkedin-Version": apiVersion,
        "X-Restli-Protocol-Version": "2.0.0",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as LinkedInShareStatisticsResponse;

    return (payload.elements ?? []).reduce((total, element) => {
      return total + (element.totalShareStatistics?.shareCount ?? 0);
    }, 0);
  } catch {
    return null;
  }
}

const getCachedVerifiedShareSnapshot = unstable_cache(
  async (slug: string): Promise<VerifiedShareSnapshot> => {
    const source = VERIFIED_SHARE_SOURCES[slug];

    if (!source) {
      return {
        message:
          "No fake counter here. Real counts only appear after we connect a verifiable source post.",
        networks: [],
        status: "unavailable",
        total: null,
      };
    }

    const [xCount, linkedInCount] = await Promise.all([
      source.x ? fetchXVerifiedShareCount(source.x.tweetIds) : Promise.resolve(null),
      source.linkedin
        ? fetchLinkedInVerifiedShareCount(source.linkedin)
        : Promise.resolve(null),
    ]);

    const networks = [
      xCount === null ? null : { count: xCount, network: "x" as const },
      linkedInCount === null
        ? null
        : { count: linkedInCount, network: "linkedin" as const },
    ].filter((entry) => entry !== null);

    if (!networks.length) {
      return {
        message:
          "The counter is ready, but it needs working platform tokens and source post IDs before it can verify shares.",
        networks: [],
        status: "needs_setup",
        total: null,
      };
    }

    return {
      message:
        "Only API-verified reposts and shares from connected network posts are counted.",
      networks,
      status: "verified",
      total: networks.reduce((sum, entry) => sum + entry.count, 0),
    };
  },
  ["verified-social-share"],
  { revalidate: 3600 }
);

export async function getVerifiedShareSnapshot(slug: string) {
  return getCachedVerifiedShareSnapshot(slug);
}
