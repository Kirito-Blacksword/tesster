import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { examSeries } from "@/lib/mock-tests";
import type { ExamId } from "@/lib/exams";

export async function GET(request: Request, { params }: { params: Promise<{ examId: string }> }) {
  const cookieStore = await cookies();
  if (cookieStore.get("employee_auth")?.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { examId } = await params;
    if (!examId) {
      return NextResponse.json({ error: "Missing examId" }, { status: 400 });
    }

    const layout = await prisma.examLayout.findUnique({
      where: { examId },
    });

    if (layout) {
      return NextResponse.json({ groups: JSON.parse(layout.groups) });
    }

    // Fallback to default
    const defaultSeries = examSeries[examId as ExamId];
    if (defaultSeries) {
      return NextResponse.json({ groups: defaultSeries.groups });
    }

    return NextResponse.json({ groups: [] });
  } catch (error: any) {
    console.error("Failed to fetch layout:", error);
    return NextResponse.json({ error: "Failed to fetch layout", details: error.message }, { status: 500 });
  }
}
