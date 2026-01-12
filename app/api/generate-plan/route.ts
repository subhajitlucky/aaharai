import { NextResponse } from "next/server";
import { generateMealPlan } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { dosha } = await request.json();
    
    if (!dosha) {
      return NextResponse.json({ error: "Dosha is required" }, { status: 400 });
    }

    const plan = await generateMealPlan(dosha);
    return NextResponse.json({ plan });

  } catch (error) {
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
