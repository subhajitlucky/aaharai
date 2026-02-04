import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, prakriti } = await request.json();

    if (!userId || !prakriti) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Map string dosha to Enum
    const doshaEnum = prakriti.toUpperCase();

    const user = await prisma.user.update({
      where: { id: userId },
      data: { prakriti: doshaEnum },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Save Prakriti Error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
