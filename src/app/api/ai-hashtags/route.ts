import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY?.trim();
    if (!groqKey) {
      return NextResponse.json({ error: "GROQ API Key is missing from environment variables." }, { status: 500 });
    }

    const groq = new Groq({ apiKey: groqKey });

    const prompt = `You are an elite YouTube SEO expert. Generate 15 highly optimized hashtags for a YouTube video about: "${topic}".

Requirements:
- Include a mix of broad (high-volume) hashtags and narrow (niche/long-tail) hashtags.
- Do NOT use generic useless tags like #video or #youtube.
- Format them exactly as a JSON array of strings.
- Each string must start with the "#" symbol.
- ONLY output the JSON array, no extra text, no markdown.

Example:
[
  "#DogTrainingTips",
  "#PuppyTraining",
  "#ObedienceTraining",
  "#HowToTrainYourDog"
]`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a YouTube SEO expert. Respond with a valid JSON array of strings ONLY. NEVER wrap the JSON in backticks or markdown."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.95,
    });

    let responseText = chatCompletion.choices[0]?.message?.content?.trim() || "[]";
    
    if (responseText.startsWith("```json")) {
      responseText = responseText.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const hashtags = JSON.parse(responseText);

    return NextResponse.json({ hashtags });
  } catch (error: any) {
    console.error("GROQ AI Error (Hashtags):", error);
    return NextResponse.json(
      { error: "Failed to generate hashtags with AI. Please try again." },
      { status: 500 }
    );
  }
}
