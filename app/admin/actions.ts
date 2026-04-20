"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "$2b$10$.p4igKqOHLSCxi2a/PsvXuy7QchrxWTrohGJjIkQoU27ryndJ6DkG";
const ADMIN_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "admin-secret-key-change-in-prod-32chars!!");

export async function loginEmployee(state: any, formData: FormData) {
  const passcode = formData.get("passcode") as string;

  if (!passcode) return { error: "Password is required" };

  try {
    const isValid = await bcrypt.compare(passcode, ADMIN_PASSWORD_HASH);
    if (!isValid) return { error: "Invalid password" };

    // Issue a signed JWT as the session token
    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(ADMIN_SECRET);

    const cookieStore = await cookies();
    cookieStore.set("employee_auth", token, {
      path: "/",
      maxAge: 60 * 60 * 8,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    redirect("/admin");
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("[loginEmployee]", error);
    return { error: "Authentication failed" };
  }
}

export async function logoutEmployee() {
  const cookieStore = await cookies();
  cookieStore.delete("employee_auth");
  redirect("/admin");
}

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("employee_auth")?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, ADMIN_SECRET);
    return payload.role === "admin";
  } catch {
    return false;
  }
}
