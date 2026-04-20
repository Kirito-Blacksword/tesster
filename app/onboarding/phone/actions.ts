"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, encrypt } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function savePhone(state: any, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const phone = (formData.get("phone") as string)?.trim();
  if (!phone) return { error: "Phone number is required" };

  await prisma.user.update({
    where: { id: session.id },
    data: { phone },
  });

  // Re-issue session with phone included
  const updated = await prisma.user.findUnique({ where: { id: session.id } });
  if (!updated) redirect("/login");

  const sessionData = await encrypt({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
    phone: updated.phone,
    allAccess: updated.allAccess,
    premiumExamIds: updated.premiumExamIds ? JSON.parse(updated.premiumExamIds) : [],
  });

  const cookieStore = await cookies();
  cookieStore.set("auth_session", sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/dashboard");
}

export async function skipPhone() {
  redirect("/dashboard");
}
