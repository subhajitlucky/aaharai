import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    // Default to Delhi coordinates if not provided
    const latitude = lat || "28.6139";
    const longitude = lon || "77.2090";

    // Use a free weather API (Open-Meteo) which doesn't require a key
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const weatherData = await weatherRes.json();
    
    const temp = weatherData.current_weather.temperature;
    
    // Ayurvedic Seasonal Logic (Simplified for Northern Hemisphere/India context)
    // 1. Shishira/Vasanta (Feb-May): Kapha Season
    // 2. Grishma (Jun-Aug): Pitta Season
    // 3. Varsha/Sharad/Hemanta (Sep-Jan): Vata Season
    
    const month = new Date().getMonth(); // 0-11
    let season = "Vata";
    let ritualAdvice = "";
    let foodAdvice = "";

    if (month >= 1 && month <= 4) {
      season = "Kapha";
      ritualAdvice = "Focus on vigorous movement and early rising to clear spring congestion.";
      foodAdvice = "Prioritize pungent, bitter, and astringent tastes. Honey and ginger are your allies.";
    } else if (month >= 5 && month <= 7) {
      season = "Pitta";
      ritualAdvice = "Seek shade and avoid intense midday heat. Cooling moonlight walks are recommended.";
      foodAdvice = "Focus on sweet, bitter, and cooling foods. Coconut water and fresh fruits are ideal.";
    } else {
      season = "Vata";
      ritualAdvice = "Maintain a strict routine and keep the body warm. Self-massage with warm oil is vital.";
      foodAdvice = "Prioritize warm, cooked, unctuous foods. Avoid cold salads and dry snacks.";
    }

    return NextResponse.json({
      temperature: temp,
      season,
      advice: {
        ritual: ritualAdvice,
        food: foodAdvice
      },
      location: lat ? "detected" : "default"
    });

  } catch (error) {
    console.error("Ritucharya Error:", error);
    return NextResponse.json({ error: "Failed to fetch seasonal data" }, { status: 500 });
  }
}
