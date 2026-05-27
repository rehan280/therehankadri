import { NextResponse } from "next/server";
import { getNextApiKey, reportQuotaExceeded } from "@/lib/youtube-keys";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const pageToken = searchParams.get("pageToken");

  if (!videoId) {
    return NextResponse.json(
      { error: "videoId is required" },
      { status: 400 }
    );
  }

  const apiKey = getNextApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Internal Server Error: No valid API keys available." },
      { status: 500 }
    );
  }

  let url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&key=${apiKey}`;
  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 403 || data.error?.errors?.[0]?.reason === "quotaExceeded") {
        reportQuotaExceeded(apiKey);
        return NextResponse.json(
          { error: "API quota exceeded, please try again." },
          { status: 503 }
        );
      }
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Video not found or comments are disabled." },
          { status: 404 }
        );
      }

      throw new Error(data.error?.message || "YouTube API error");
    }

    // Extract just the relevant fields to keep payload small
    const comments = data.items.map((item: any) => {
      const snippet = item.snippet.topLevelComment.snippet;
      return {
        id: item.id,
        authorDisplayName: snippet.authorDisplayName,
        authorProfileImageUrl: snippet.authorProfileImageUrl,
        authorChannelId: snippet.authorChannelId?.value || "",
        textDisplay: snippet.textDisplay,
        textOriginal: snippet.textOriginal,
        likeCount: snippet.likeCount,
        publishedAt: snippet.publishedAt,
      };
    });

    return NextResponse.json({
      comments,
      nextPageToken: data.nextPageToken || null,
      totalResults: data.pageInfo?.totalResults || 0, // Note: YouTube API often doesn't return totalResults for commentThreads
    });

  } catch (error: any) {
    console.error("YouTube Comments Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments. Please try again." },
      { status: 500 }
    );
  }
}
