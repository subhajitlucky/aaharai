import { NextResponse } from "next/server";

export const runtime = "edge";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: Request) {
  try {
    const { image } = await request.json(); // base64 image
    
    if (!image) return NextResponse.json({ error: "Image is required" }, { status: 400 });

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({
        analysis: {
          score: 85,
          category: "Satvik",
          breakdown: "This meal contains fresh mung dal, steamed rice, and ghee-sautéed vegetables.",
          advice: "Perfectly balanced! Adding a pinch of black pepper would improve digestion further.",
          items: ["Mung Dal", "Rice", "Carrots", "Ghee"]
        },
        isMock: true
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
        "messages": [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": "Analyze this food image based on Ancient Indian (Ayurvedic) dietary principles. Categorize it as Satvik, Rajasic, or Tamasic. Give a Prana Score out of 100. Return ONLY JSON: { \"score\": number, \"category\": \"string\", \"breakdown\": \"string\", \"advice\": \"string\", \"items\": [\"string\"] }"
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": image // The base64 string including data:image/...
                }
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const cleanJson = content.replace(/```json|```/g, "").trim();
    
    return NextResponse.json({ analysis: JSON.parse(cleanJson) });

  } catch (error) {
    console.error("Vision API Error:", error);
    return NextResponse.json({ error: "Failed to analyze food" }, { status: 500 });
  }
}
