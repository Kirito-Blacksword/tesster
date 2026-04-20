import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "admin-secret-key-change-in-prod-32chars!!"
);

async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("employee_auth")?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, ADMIN_SECRET);
    return payload.role === "admin";
  } catch { return false; }
}

// Helper to save base64 image and return public URL
function saveBase64Image(base64Data: string): string {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 string");
  }

  const ext = matches[1].split("/")[1] || "png";
  const buffer = Buffer.from(matches[2], "base64");
  const filename = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  fs.writeFileSync(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await request.json();

    // Process questions and images
    const questions = data.questions.map((q: any) => {
      let qImage = q.image;
      if (qImage && qImage.startsWith("data:")) {
        qImage = saveBase64Image(qImage);
      }

      const options = q.options?.map((opt: any) => {
        let optImage = opt.image;
        if (optImage && optImage.startsWith("data:")) {
          optImage = saveBase64Image(optImage);
        }
        return { text: opt.text, image: optImage };
      });

      return {
        index: q.index,
        section: q.section,
        subject: q.subject,
        type: q.type,
        text: q.text,
        options: options ? JSON.stringify(options) : null,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "No explanation provided.",
        image: qImage,
        isBonus: q.isBonus || false,
      };
    });

    const newExam = await prisma.customExam.create({
      data: {
        name: data.name,
        durationMinutes: Number(data.durationMinutes),
        maxMarks: Number(data.maxMarks),
        cardDetails: data.cardDetails,
        scoringCorrect: Number(data.scoringCorrect),
        scoringIncorrect: Number(data.scoringIncorrect),
        instructions: JSON.stringify(data.instructions || []),
        paletteLegend: JSON.stringify(data.paletteLegend || ["Not Visited", "Answered", "Not Answered", "Marked for Review", "Answered & Marked"]),
        baseExamId: data.baseExamId,
        isPremium: Boolean(data.isPremium),
        category: data.category || null,
        section: data.section || null,
        published: false, // starts as draft
        questions: {
          create: questions,
        },
      },
    });

    return NextResponse.json({ success: true, examId: newExam.id });
  } catch (error: any) {
    console.error("Failed to save exam:", error);
    return NextResponse.json({ error: "Failed to save exam", details: error.message }, { status: 500 });
  }
}
