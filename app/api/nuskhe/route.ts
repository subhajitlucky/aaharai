import { NextResponse } from "next/server";

export const runtime = "edge";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: Request) {
  try {
    const { symptom, dosha } = await request.json();
    
    if (!symptom) return NextResponse.json({ error: "Symptom is required" }, { status: 400 });

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ 
        remedy: {
          title: "Ginger & Honey Elixir",
          procedure: "Grind fresh ginger to extract 1 tsp juice. Mix with 1 tsp raw honey and a pinch of black pepper.",
          why: "Ginger stokes the digestive fire (Agni) while honey soothes the throat.",
          warning: "Avoid if you have high acidity or ulcers."
        },
        isMock: true
      });
    }

    const doshaContext = dosha ? `The user has a dominant ${dosha} Prakriti. Tailor the remedy to be balancing for them.` : "";

    const prompt = `
      The user reports this symptom: "${symptom}". ${doshaContext}
      Provide an Ancient Indian (Ayurvedic) "Nuskha" (Home Remedy) using common kitchen ingredients.
      
      Requirements:
      1. Use ingredients like Turmeric, Cumin, Ginger, Tulsi, Ghee, etc.
      2. If a Dosha is provided, ensure the remedy doesn't aggravate it (e.g. for Pitta, don't suggest too much heat).
      3. Keep the procedure simple and actionable.

      Format (JSON ONLY):
      {
        "title": "Short Creative Name",
        "procedure": "Step-by-step instructions (max 2 sentences)",
        "why": "Brief Ayurvedic logic",
        "warning": "When to avoid this remedy"
      }
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Aaharai"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
        "messages": [
          {"role": "system", "content": "You are a Master of Ayurvedic Nuskhe and Ancient Remedies. JSON only."},
          {"role": "user", "content": prompt}
        ]
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const cleanJson = content.replace(/```json|```/g, "").trim();
    
    return NextResponse.json({ remedy: JSON.parse(cleanJson) });

  } catch (error) {
    return NextResponse.json({ error: "Failed to find remedy" }, { status: 500 });
  }
}
