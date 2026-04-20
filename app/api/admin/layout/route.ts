import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get("employee_auth")?.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { examId, groups } = data;

    if (!examId || !groups) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const title = `${examId.toUpperCase()} Mock Tests`; // Default title, can be expanded later

    const layout = await prisma.examLayout.upsert({
      where: { examId },
      update: {
        groups: JSON.stringify(groups),
      },
      create: {
        examId,
        title,
        groups: JSON.stringify(groups),
      },
    });

    return NextResponse.json({ success: true, layout });
  } catch (error: any) {
    console.error("Failed to save layout:", error);
    return NextResponse.json({ error: "Failed to save layout", details: error.message }, { status: 500 });
  }
}
