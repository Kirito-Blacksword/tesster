import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  // Always fetch fresh user data from DB so phone/premiums are up to date
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, name: true, email: true, phone: true, primaryGoal: true, role: true, allAccess: true, premiumExamIds: true },
    });
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({
      user: {
        ...user,
        premiumExamIds: user.premiumExamIds ? JSON.parse(user.premiumExamIds) : [],
      },
    });
  } catch {
    return NextResponse.json({ user: session });
  }
}
