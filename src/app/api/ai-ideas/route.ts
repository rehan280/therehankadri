import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { topic, videos, suggestions } = await request.json();

    if (!topic || !videos || !Array.isArray(videos)) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY?.trim();
    if (!groqKey) {
      return NextResponse.json({ error: "GROQ API Key is missing from environment variables." }, { status: 500 });
    }

    const groq = new Groq({ apiKey: groqKey });

    // Build rich context from YouTube Data API results
    let popularVideosContext = "";
    if (videos.length > 0) {
      popularVideosContext = videos.slice(0, 5).map((v: any) => 
        `  • ${v.title.length > 80 ? v.title.substring(0, 80) + '...' : v.title} (Channel: ${v.channel})`
      ).join("\n");
    } else {
      popularVideosContext = `  • No specific videos found, use general ${topic} topics`;
    }

    let trendingContext = "";
    if (suggestions && suggestions.length > 0) {
      trendingContext = suggestions.slice(0, 5).map((s: string, i: number) => `  ${i+1}. ${s}`).join("\n");
    } else {
      trendingContext = `  1. ${topic} basics\n  2. ${topic} tips\n  3. ${topic} trends 2025`;
    }

    const prompt = `You are an elite YouTube content strategist with 10+ years of experience creating viral videos.

NICHE: ${topic}

CURRENT TRENDING QUERIES (What people are actually searching):
${trendingContext}

TOP PERFORMING VIDEOS IN THIS NICHE (What is currently ranking):
${popularVideosContext}

TASK: Generate 10 HIGHLY SPECIFIC, unique video ideas for the "${topic}" niche that:
- Use proven viral formulas (How-to, Listicles, Challenges, Reviews, Comparisons)
- Target searchable keywords from the trending queries
- Create curiosity gaps that make viewers click
- Be 50-70 characters for optimal CTR

DESCRIPTION REQUIREMENTS (CRITICAL):
The description MUST include WHAT TO SHOW IN THE VIDEO in short, actionable words.
Format: [Brief hook] + [What to show/cover: item 1, item 2, item 3]

CATEGORIES: Tutorial, Review, Vlog, Challenge, Tips & Tricks, Comparison, Educational, Entertainment, How-To, Listicle

Respond ONLY with valid JSON in this exact format, without markdown wrapping or backticks:
[
  {
    "title": "How to Master [Topic] in 2025 - Beginner's Guide",
    "description": "Complete mastery guide! Show: setup process, basic techniques, advanced strategies, common mistakes.",
    "trend_score": 85,
    "category": "Tutorial"
  }
]`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a world-class YouTube content strategist specializing in ${topic}. You ALWAYS respond in valid JSON format representing an array of objects. NEVER wrap the JSON in backticks or markdown.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.85,
      max_tokens: 2000,
      top_p: 0.9,
    });

    let responseText = chatCompletion.choices[0]?.message?.content?.trim() || "[]";
    
    // Clean markdown if Groq injected it
    if (responseText.startsWith("```json")) {
      responseText = responseText.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const ideas = JSON.parse(responseText);

    return NextResponse.json({ ideas });
  } catch (error: any) {
    console.error("GROQ AI Error (Ideas):", error);
    return NextResponse.json(
      { error: "Failed to generate ideas with AI. Please try again." },
      { status: 500 }
    );
  }
}
