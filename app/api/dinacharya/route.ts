import { NextResponse } from "next/server";

export const runtime = "edge";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: Request) {
  try {
    const { wakeUpTime, dosha } = await request.json();
    
    if (!wakeUpTime || !dosha) {
      return NextResponse.json({ error: "Wake up time and Dosha are required" }, { status: 400 });
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ 
        rituals: [
          { time: "05:30 AM", activity: "Brahma Muhurta", description: "Wake up in the ambrosial hours for peak mental clarity." },
          { time: "06:00 AM", activity: "Jivha Nirlekhana", description: "Tongue scraping to remove toxins (Ama) accumulated overnight." },
          { time: "07:30 AM", activity: "Vyayama", description: "Physical exercise at 50% capacity to stoke the digestive fire." }
        ],
        isMock: true
      });
    }

    const prompt = `
      Create a personalized Ayurvedic Daily Routine (Dinacharya) for a person with a dominant "${dosha}" dosha who wakes up at ${wakeUpTime}.
      
      Include:
      1. Morning cleansing rituals (Kriyas).
      2. Best time for the heaviest meal.
      3. Specific activity adjustments for the ${dosha} nature.
      4. Evening wind-down rituals.

      Format (JSON ONLY):
      {
        "rituals": [
          { "time": "HH:MM AM/PM", "activity": "Name", "description": "Short explanation" }
        ]
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
          {"role": "system", "content": "You are an Ayurvedic Life Coach. JSON only."},
          {"role": "user", "content": prompt}
        ]
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const cleanJson = content.replace(/```json|```/g, "").trim();
    
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error) {
    return NextResponse.json({ error: "Failed to build routine" }, { status: 500 });
  }
}
