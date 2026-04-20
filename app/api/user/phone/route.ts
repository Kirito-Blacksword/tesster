import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { phone } = await request.json();
  if (!phone?.trim()) return NextResponse.json({ error: "Phone required" }, { status: 400 });

  await prisma.user.update({
    where: { id: session.id },
    data: { phone: phone.trim() },
  });

  return NextResponse.json({ success: true });
}
