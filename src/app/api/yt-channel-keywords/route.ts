import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let target = searchParams.get("target");

  if (!target) {
    return NextResponse.json({ error: "Missing target URL or handle" }, { status: 400 });
  }

  // Handle formats like: MonkeyxMagic, @MonkeyxMagic, https://youtube.com/@MonkeyxMagic
  if (!target.includes("youtube.com")) {
    target = target.startsWith("@") ? target : `@${target}`;
    target = `https://www.youtube.com/${target}`;
  }

  try {
    const res = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch channel page" }, { status: 500 });
    }

    const html = await res.text();
    const match = html.match(/<meta name="keywords" content="([^"]+)">/i);

    if (!match || !match[1]) {
      return NextResponse.json({ keywords: [] });
    }

    const rawContent = match[1];
    
    // The keywords are often HTML entity encoded, and separated by spaces or commas
    // e.g. "monkey magic" "melodies of india" OR gaming, monkey magic, minecraft
    const unescaped = rawContent.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    
    let keywords: string[] = [];
    
    if (unescaped.includes(',')) {
      // If there are commas, it's likely a comma-separated list
      keywords = unescaped.split(',').map(k => k.replace(/^"/, '').replace(/"$/, '').trim());
    } else {
      // Otherwise, it's space-separated, with phrases enclosed in quotes
      // Regex matches either something in double quotes, or a sequence of non-space characters
      const regex = /"([^"]+)"|(\S+)/g;
      let m;
      while ((m = regex.exec(unescaped)) !== null) {
        if (m[1]) {
          keywords.push(m[1].trim());
        } else if (m[2]) {
          keywords.push(m[2].trim());
        }
      }
    }
    
    keywords = keywords.filter(k => k && k.length > 0);

    return NextResponse.json({ keywords });

  } catch (error: any) {
    console.error("yt-channel-keywords error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
