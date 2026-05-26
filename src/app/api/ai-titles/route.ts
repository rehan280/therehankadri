import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { topic, videos } = await request.json();

    if (!topic || !videos || !Array.isArray(videos)) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY?.trim();
    if (!groqKey) {
      return NextResponse.json({ error: "GROQ API Key is missing from environment variables." }, { status: 500 });
    }

    const groq = new Groq({ apiKey: groqKey });

    const trendingContext = videos.slice(0, 5).map((v: any) => `- ${v.title}`).join("\n");

    const prompt = `You are a world-class YouTube title expert. Create 10 VIRAL-WORTHY titles for a video.

User's Video Topic: ${topic}

Top Trending Titles in this Niche (For context/inspiration):
${trendingContext || "No trending titles available"}

Requirements:
- Use proven formulas (How to, I tried X for Y days, Secrets, etc.)
- Include power words (ULTIMATE, SECRET, PROVEN, SHOCKING) where appropriate
- Create curiosity gaps
- Keep length between 50-70 characters
- Front-load the hook
- Make each unique

Respond ONLY with a valid JSON array of strings, without markdown wrapping or backticks.
Example Output:
[
  "How to Master [Topic] in 30 Days",
  "I Tried [Topic] for a Week (Shocking Results)",
  "5 [Topic] Secrets Nobody Tells You"
]`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a YouTube title expert. Respond with a valid JSON array of strings ONLY. NEVER wrap the JSON in backticks or markdown."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.9,
      max_tokens: 1000,
      top_p: 0.95,
    });

    let responseText = chatCompletion.choices[0]?.message?.content?.trim() || "[]";
    
    if (responseText.startsWith("```json")) {
      responseText = responseText.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const titles = JSON.parse(responseText);

    return NextResponse.json({ titles });
  } catch (error: any) {
    console.error("GROQ AI Error (Titles):", error);
    return NextResponse.json(
      { error: "Failed to generate titles with AI. Please try again." },
      { status: 500 }
    );
  }
}
