import { NextResponse } from "next/server";

export const runtime = "edge";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: Request) {
  try {
    const { symptom } = await request.json();
    
    if (!symptom) return NextResponse.json({ error: "Symptom is required" }, { status: 400 });

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ 
        remedy: {
          title: "Warm Ginger & Honey Elixir",
          procedure: "Grate 1 inch of fresh ginger, extract the juice, and mix with a spoonful of raw honey.",
          why: "Ginger reduces inflammation while honey coats the throat and boosts immunity.",
          warning: "Avoid if you have high acidity."
        },
        isMock: true
      });
    }

    const prompt = `
      The user is feeling: "${symptom}".
      Suggest a safe, traditional Indian Home Remedy (Nuskha) using common kitchen ingredients.
      
      Rules:
      1. Use only natural ingredients found in an Indian kitchen.
      2. Keep it simple and easy to prepare.
      3. MUST include a small safety disclaimer.
      
      Format (JSON ONLY):
      {
        "title": "Name of Remedy",
        "procedure": "Step-by-step instructions",
        "why": "The Ayurvedic logic behind it",
        "warning": "When to avoid this or see a doctor"
      }
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
        "messages": [
          {"role": "system", "content": "You are a wise Ayurvedic practitioner. JSON only."},
          {"role": "user", "content": prompt}
        ]
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const cleanJson = content.replace(/```json|```/g, "").trim();
    
    return NextResponse.json({ remedy: JSON.parse(cleanJson) });

  } catch (error) {
    return NextResponse.json({ error: "Failed to find a remedy" }, { status: 500 });
  }
}
