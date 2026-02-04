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
                "text": "Analyze this food image as a Master Ayurvedic Nutritionist. Perform a deep Satvik analysis:\n\n1. Identify all visible ingredients and assess their freshness/processing level.\n2. Classify the overall meal as Satvik (Pure, Fresh, Harmonious), Rajasic (Stimulating, Spicy, Heavy), or Tamasic (Stale, Over-processed, Dull).\n3. Calculate a 'Prana Score' (0-100) based on:\n   - Freshness (30%)\n   - Ingredient Quality (30%)\n   - Balancing potential for Doshas (20%)\n   - Processing level (20%)\n4. Provide a 'breakdown' explaining the logic and an 'advice' snippet from a Gurukul perspective (e.g., 'Add ghee to balance dryness' or 'Reduce spice to calm Pitta').\n\nReturn ONLY JSON:\n{ \n  \"score\": number, \n  \"category\": \"Satvik\" | \"Rajasic\" | \"Tamasic\", \n  \"breakdown\": \"string\", \n  \"advice\": \"string\", \n  \"items\": [\"string\"] \n}"
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
