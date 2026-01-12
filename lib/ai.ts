export const runtime = "edge";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "Aaharai";

export async function generateMealPlan(dosha: string) {
  if (!OPENROUTER_API_KEY) {
    console.warn("⚠️ No OpenRouter API Key found. Returning mock data.");
    return getMockPlan(dosha);
  }

  const prompt = `
    You are an expert Ayurvedic Nutritionist.
    Create a 1-day sample meal plan (Breakfast, Lunch, Dinner) for a person with a dominant "${dosha}" dosha.
    
    Rules:
    1. STRICTLY Vegetarian (Satvik). No eggs, no meat.
    2. Use ancient Indian ingredients (e.g., Jowar, Bajra, Ghee, Mung Dal).
    3. Explain WHY this food is good for ${dosha} (1 sentence).
    4. Return ONLY valid JSON with this structure:
    {
      "breakfast": { "name": "...", "description": "...", "benefits": "..." },
      "lunch": { "name": "...", "description": "...", "benefits": "..." },
      "dinner": { "name": "...", "description": "...", "benefits": "..." }
    }
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-lite-preview-02-05:free", // Using a free/cheap fast model
        "messages": [
          {"role": "system", "content": "You are a helpful Ayurvedic assistant that outputs only JSON."},
          {"role": "user", "content": prompt}
        ]
      })
    });

    const data = await response.json();
    
    // Parse the content if it's a string, or handle potential errors
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content from AI");

    // Clean markdown code blocks if present
    const cleanJson = content.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("AI Generation Failed:", error);
    return getMockPlan(dosha);
  }
}

function getMockPlan(dosha: string) {
  // Fallback data so the UI always works
  const plans: any = {
    "Vata": {
      breakfast: { name: "Warm Oatmeal with Ghee & Almonds", description: "Cooked oats with a spoonful of ghee, cinnamon, and soaked almonds.", benefits: "Warm, heavy, and oily qualities balance Vata's dryness." },
      lunch: { name: "Kitchari (Moong Dal & Rice)", description: "Basmati rice and moong dal cooked soft with cumin and ginger.", benefits: "Easy to digest and grounding." },
      dinner: { name: "Pumpkin Soup", description: "Creamy pumpkin soup with coconut milk and nutmeg.", benefits: "Soothing and warm for the evening." }
    },
    "Pitta": {
      breakfast: { name: "Cooling Fruit Bowl", description: "Sweet apples, pears, and pomegranate seeds with mint.", benefits: "Naturally sweet and cooling to reduce body heat." },
      lunch: { name: "Quinoa & Cucumber Salad", description: "Quinoa with cucumber, cilantro, and lime dressing.", benefits: "Light and refreshing without being spicy." },
      dinner: { name: "Steamed Vegetables & Rice", description: "Steamed broccoli, zucchini, and white basmati rice.", benefits: "Mild and easy on the digestive fire." }
    },
    "Kapha": {
      breakfast: { name: "Spiced Quinoa Porridge", description: "Quinoa cooked with ginger, cloves, and honey (no milk).", benefits: "Light, warm, and spicy to stimulate metabolism." },
      lunch: { name: "Millet Roti & Bitter Gourd Sabzi", description: "Bajra roti with light karela sabzi.", benefits: "Bitter and pungent tastes reduce Kapha heaviness." },
      dinner: { name: "Lentil Soup", description: "Spicy masoor dal soup with black pepper.", benefits: "Light and protein-rich." }
    }
  };
  return plans[dosha] || plans["Vata"];
}
