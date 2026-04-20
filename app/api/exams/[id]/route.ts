import { NextResponse } from "next/server";
import { getCustomExam } from "@/lib/custom-exams";
import { getExamConfig, type ExamConfig } from "@/lib/exams";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Try predefined first
  let config: ExamConfig | undefined = getExamConfig(id);
  
  // Try custom
  if (!config) {
    config = (await getCustomExam(id)) ?? undefined;
  }

  if (!config) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  return NextResponse.json(config);
}
