// benky-fy/frontend/src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that don't require authentication
const publicPaths = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/google",
  "/auth/google/callback",
  "/auth/logout",
  "/debug-env",
];

export function middleware(request: NextRequest) {
  // Bypass if AUTH_BYPASS is true, OR if we are in dev and it is NOT explicitly false
  const enableBypass = process.env.AUTH_BYPASS === "true" || (process.env.NODE_ENV === "development" && process.env.AUTH_BYPASS !== "false");

  if (enableBypass) {
    console.log("[MW] WARNING: Development mode BYPASSING authentication");
    const isAuthRoute =
      request.nextUrl.pathname.startsWith("/auth/google") ||
      request.nextUrl.pathname === "/auth/login";

    const session = request.cookies.get("benkyfy_session");

    // If hitting auth routes in dev/debug, skip Google and go home
    const response = isAuthRoute
      ? NextResponse.redirect(new URL("/home", request.url))
      : NextResponse.next();

    // Ensure dev session exists
    if (!session) {
      const devSessionData = {
        user: {
          id: "dev-user",
          name: "Middleware User",
          email: "dev@example.com",
          picture: "/user_icon.svg",
          joinDate: new Date().toISOString().split("T")[0],
          currentLevel: "Beginner",
          totalStudyTime: "0 hours",
          streakDays: 0,
          totalWordsLearned: 0,
          favoriteModules: ["Hiragana", "Basic Words", "Common Phrases"],
        },
        provider: "development",
        authenticated: true,
        expires: Date.now() + 24 * 60 * 60 * 1000,
      };

      response.cookies.set({
        name: "benkyfy_session",
        value: JSON.stringify(devSessionData),
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60,
        path: "/",
      });
    }

    return response;
  }

  const isPublicPath = publicPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith("/api/") ||
      request.nextUrl.pathname.startsWith(path + "/"),
  );


  if (isPublicPath) {
    return NextResponse.next();
  }

  // Enforce session in non-public paths
  const session = request.cookies.get("benkyfy_session");
  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
