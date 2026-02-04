import { NextResponse } from "next/server";

export const runtime = "edge";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: Request) {
  try {
    const { craving, dosha } = await request.json();
    
    if (!craving) return NextResponse.json({ error: "Craving is required" }, { status: 400 });

    const doshaContext = dosha ? `Specifically for a person with a ${dosha} Prakriti.` : "";

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ 
        swap: {
          name: "Ragi & Vegetable Utopia",
          description: "A crisp finger-millet base topped with farm-fresh bell peppers, tomatoes, and herbs.",
          why: "Satisfies the crunch and savory craving without the refined flour and grease.",
          ingredients: ["Ragi Flour", "Tomatoes", "Basil", "Olive Oil"]
        },
        isMock: true
      });
    }

    const prompt = `
      The user craves: "${craving}". ${doshaContext}
      Suggest a Healthy, Ancient Indian (Satvik/Ayurvedic) alternative that mimics the texture or flavor profile of this craving.
      
      Requirements:
      1. Mimic the psychological need (e.g. crunch for chips, sweetness for soda).
      2. If a Dosha is provided, ensure the choice is balancing (e.g. for Pitta, avoid heavy heat).
      3. Use traditional ingredients like Jowar, Ragi, Amla, Kokum, etc.

      Format (JSON ONLY):
      {
        "name": "Creative Name",
        "description": "Mouth-watering description (1 sentence)",
        "why": "Why it satisfies the craving and how it aligns with the ${dosha || 'Ayurvedic'} diet",
        "ingredients": ["Item 1", "Item 2", "Item 3"]
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
          {"role": "system", "content": "You are a creative Ayurvedic chef and nutritionist. JSON only."},
          {"role": "user", "content": prompt}
        ]
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const cleanJson = content.replace(/```json|```/g, "").trim();
    
    return NextResponse.json({ swap: JSON.parse(cleanJson) });

  } catch (error) {
    console.error("Swap API Error:", error);
    return NextResponse.json({ error: "Failed to find a swap" }, { status: 500 });
  }
}
