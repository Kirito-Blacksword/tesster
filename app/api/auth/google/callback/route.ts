import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/auth";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=GoogleAuthNotConfigured", request.url));
  }

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectUri = `${origin}/api/auth/google/callback`;

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=MissingCode", request.url));
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange token");
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // 2. Fetch user profile
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const profile = await userResponse.json();
    const { id: googleId, email, name } = profile;

    // 3. Upsert user in database
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { email },
          data: { googleId },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          role: "STUDENT",
        },
      });
    }

    // 4. Create internal session
    const sessionData = await encrypt({ id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, allAccess: user.allAccess, premiumExamIds: user.premiumExamIds ? JSON.parse(user.premiumExamIds) : [] });

    // If new Google user has no phone, collect it before going to dashboard
    const destination = !user.phone ? "/onboarding/phone" : "/dashboard";
    const response = NextResponse.redirect(new URL(destination, request.url));

    // Set cookie directly on the response so it's included in the redirect
    response.cookies.set("auth_session", sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.redirect(new URL("/login?error=AuthenticationFailed", request.url));
  }
}
