"use server";

import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function registerStudent(state: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!email || !password || !name) {
    return { error: "Name, email and password are required" };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Email already in use" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      phone,
      password: hashedPassword,
      role: "STUDENT",
    },
  });

  const sessionData = await encrypt({ id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, allAccess: user.allAccess, premiumExamIds: user.premiumExamIds ? JSON.parse(user.premiumExamIds) : [] });
  const cookieStore = await cookies();
  cookieStore.set("auth_session", sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/");
}

export async function loginStudent(state: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return { error: "Invalid credentials or account uses Google Sign-In" };
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return { error: "Invalid credentials" };
  }

  const sessionData = await encrypt({ id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, allAccess: user.allAccess, premiumExamIds: user.premiumExamIds ? JSON.parse(user.premiumExamIds) : [] });
  const cookieStore = await cookies();
  cookieStore.set("auth_session", sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
  redirect("/");
}
