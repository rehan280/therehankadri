A video's ID is the permanent identifier that doesn't change even if the title, description, or thumbnail changes. It's the 11-character string after "v=" in every YouTube URL.

Most of the time you don't need to think about it. But for specific technical tasks - building embeds, creating timestamp links, setting up API calls, or verifying a video's identity - the video ID is what you need.

This tool extracts it instantly from any YouTube URL.

## When you actually need a YouTube video ID

**Building embed codes:** The standard YouTube embed uses the video ID directly. `<iframe src="https://www.youtube.com/embed/[VIDEO_ID]">`. The video ID is the core of every embed code.

**Creating direct video links:** The short YouTube URL format is `https://youtu.be/[VIDEO_ID]`. If you know the ID, you can construct this URL without opening the video.

**YouTube API calls:** The YouTube Data API v3 uses video IDs as the primary identifier for most requests. If you're building anything that fetches video data programmatically, you need the ID.

**Thumbnail URLs:** YouTube thumbnail URLs are structured with the video ID: `https://img.youtube.com/vi/[VIDEO_ID]/maxresdefault.jpg`. Know the ID, know the thumbnail URL.

**Cross-referencing videos:** If you're maintaining a database or spreadsheet of videos, storing the video ID (not the full URL) is the most compact and permanent identifier.

**Verifying video identity:** URLs can break. Titles can change. But the video ID never changes for a video's lifetime on the platform.

## How to use the video ID finder

**Step 1:** Copy any YouTube video URL. Full URL, short youtu.be URL, or URL with extra parameters - all work.

**Step 2:** Paste it into this tool.

**Step 3:** Hit Find. Your 11-character video ID appears instantly.

**Step 4:** Use it wherever you need it.

## Finding the video ID manually

If you want to find the video ID without a tool, look at the URL:

For a standard URL like `https://www.youtube.com/watch?v=dQw4w9WgXcQ`, the video ID is the value after `v=`: **dQw4w9WgXcQ**

For a short URL like `https://youtu.be/dQw4w9WgXcQ`, the video ID is the last part of the path: **dQw4w9WgXcQ**

For a Shorts URL like `https://www.youtube.com/shorts/dQw4w9WgXcQ`, the video ID is after `/shorts/`: **dQw4w9WgXcQ**

Every format has the ID in a predictable location. The tool handles the parsing so you don't have to count characters.

## Video IDs vs. channel IDs vs. playlist IDs

YouTube uses different ID formats for different content types:

**Video IDs:** 11 characters. Start with any letter/number. Example: `dQw4w9WgXcQ`

**Channel IDs:** 24 characters starting with "UC". Example: `UCxxxxxxxxxxxxxxxxxxxxxx`

**Playlist IDs:** Usually 34 characters starting with "PL". Example: `PLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Shorts:** Same format as regular video IDs - Shorts are just videos uploaded in vertical format.

If you're working with an API or automation and need to understand which ID type to use for which call, the length and prefix make it clear.

## Frequently asked questions

**Does the video ID change if I edit the video?**
No. The video ID is assigned when the video is uploaded and never changes. Editing the title, description, thumbnail, or even the video content using YouTube's editor does not affect the ID.

**What if the URL has extra parameters after the video ID?**
This tool strips all parameters and returns just the clean 11-character video ID. `?t=90&list=PL...&feature=share` is irrelevant - you get the core ID.

**Can two different videos have the same ID?**
No. Video IDs are unique identifiers. Every video on YouTube has a distinct 11-character ID.

**What happens to a video ID when a video is deleted?**
The ID still exists in your browser history, bookmarks, or anywhere you saved it - but pointing to it returns a "video not found" error. Deleted videos' IDs are retired and not reused.

---

## The two-minute technical setup this ID enables

If you've just started building any kind of website or tool that features YouTube content, the video ID is the technical foundation for everything.

Once you have it, you can:
- Construct the embed code directly: `<iframe src="https://www.youtube.com/embed/[ID]" frameborder="0" allowfullscreen></iframe>`
- Access the thumbnail: `https://img.youtube.com/vi/[ID]/maxresdefault.jpg`
- Build the short share link: `https://youtu.be/[ID]`
- Query the YouTube API for all video metadata

That's four different technical outputs from one 11-character string. This tool gets you that string in under 10 seconds.
