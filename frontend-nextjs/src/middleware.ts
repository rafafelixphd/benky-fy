import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that don't require authentication
const publicPaths = [
  "/",
  "/auth/login",
  "/api/auth/google",
  "/api/auth/google/callback",
  "/auth/logout",
];

export function middleware(request: NextRequest) {
  // Check if the path is public
  const isPublicPath = publicPaths.some(
    (path) =>
      request.nextUrl.pathname === path || // Exact match
      request.nextUrl.pathname.startsWith("/api/") || // All API routes
      request.nextUrl.pathname.startsWith(path + "/"), // Subpaths
  );

  // Allow public paths without session
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Development bypass - allow access without authentication in development
  if (process.env.NODE_ENV === "development") {
    // Set a development session cookie if none exists
    const session = request.cookies.get("benkyfy_session");
    if (!session) {
      const response = NextResponse.next();
      const devSessionData = {
        user: {
          id: "dev-user",
          name: "Development User",
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
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };

      response.cookies.set({
        name: "benkyfy_session",
        value: JSON.stringify(devSessionData),
        httpOnly: false, // Allow JavaScript access in development
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      });

      return response;
    }
  }

  // Get session token from cookies
  const session = request.cookies.get("benkyfy_session");

  // Redirect to login if no session
  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
