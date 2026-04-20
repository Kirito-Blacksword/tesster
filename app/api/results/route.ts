import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    console.error("[POST /api/results] No session — returning 401");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    console.log("[POST /api/results] Saving for user:", session.id, "examId:", data.examId);

    const result = await prisma.result.create({
      data: {
        userId: session.id,
        examId: String(data.examId ?? ""),
        examName: String(data.examName ?? ""),
        score: Math.round(Number(data.score) || 0),
        maxScore: Math.round(Number(data.maxScore) || 0),
        payload: JSON.stringify(data),
      },
    });

    console.log("[POST /api/results] Saved, resultId:", result.id);
    return NextResponse.json({ success: true, resultId: result.id });
  } catch (error: any) {
    console.error("[POST /api/results] Error:", error.message);
    return NextResponse.json({ error: "Failed to save result", details: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const examId = searchParams.get("examId");
  const resultId = searchParams.get("resultId");

  try {
    if (resultId) {
      // Fetch a specific result by its DB id
      const result = await prisma.result.findFirst({
        where: { id: resultId, userId: session.id },
      });
      if (result) {
        return NextResponse.json({ result: JSON.parse(result.payload) });
      }
      return NextResponse.json({ result: null });
    }

    if (examId) {
      const result = await prisma.result.findFirst({
        where: { userId: session.id, examId },
        orderBy: { createdAt: "desc" }
      });
      if (result) {
        return NextResponse.json({ result: JSON.parse(result.payload) });
      }
      return NextResponse.json({ result: null });
    }

    // Return all for dashboard
    const results = await prisma.result.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, examId: true, examName: true, score: true, maxScore: true, createdAt: true }
    });

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
