import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin sub-routes (not /admin itself which shows login form)
  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    const token = request.cookies.get("employee_auth")?.value;

    // If no token at all, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Basic check: token must be a JWT (3 dot-separated base64 parts)
    // Full verification happens in the server action/page
    const parts = token.split(".");
    if (parts.length !== 3) {
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
