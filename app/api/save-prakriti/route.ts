import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/auth-options";

export async function POST(request: Request) {
  try {
    // SECURITY: never trust userId from the request body (spoofable).
    // Derive it from the next-auth session instead.
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prakriti } = await request.json();

    if (!prakriti) {
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
