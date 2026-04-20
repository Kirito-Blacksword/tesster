import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "admin-secret-key-change-in-prod-32chars!!"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin itself (which shows login form)
  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    const token = request.cookies.get("employee_auth")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    try {
      const { payload } = await jwtVerify(token, ADMIN_SECRET);
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    } catch {
      // Invalid or expired token
      const response = NextResponse.redirect(new URL("/admin", request.url));
      response.cookies.delete("employee_auth");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
