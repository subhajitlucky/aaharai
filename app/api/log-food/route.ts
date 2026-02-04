import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, foodName, score, category } = await request.json();

    if (!userId || !foodName || score === undefined) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    // 1. Create the Food Log entry
    const log = await prisma.foodLog.create({
      data: {
        userId,
        foodName,
        isSatvik: category === "Satvik",
        // We can extend the schema later to store score/category if needed, 
        // for now mapping to existing isSatvik boolean
      },
    });

    // 2. Update or Create the Streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await prisma.streak.upsert({
      where: { userId },
      update: {
        current: { increment: 1 },
        lastLog: new Date(),
      },
      create: {
        userId,
        current: 1,
        best: 1,
        lastLog: new Date(),
      },
    });

    return NextResponse.json({ success: true, log, streak });
  } catch (error) {
    console.error("Log Food Error:", error);
    return NextResponse.json({ error: "Failed to log food" }, { status: 500 });
  }
}
