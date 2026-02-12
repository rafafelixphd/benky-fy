import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { getBaseUrl } from "@/lib/utils/api-utils";


const client = new OAuth2Client(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  `${getBaseUrl()}/auth/google/callback`
);

export async function validateGoogleSession(request: NextRequest, codeParamName: string = "code", redirectUrl: string = "/home") {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get(codeParamName);

    if (!code) {
      return NextResponse.redirect(new URL("/auth/login", getBaseUrl()));
    }

    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("No payload in ID token");
    }

    console.log("[AUTH] Login attempt:", {
      email: payload.email,
      name: payload.name,
      google_id: payload.sub,
    });

    // Call Flask backend to upsert user in database
    const flaskApiUrl = process.env.FLASK_API_URL || "http://backend:8080";
    const upsertResponse = await fetch(`${flaskApiUrl}/v2/auth/upsert-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.headers.get("user-agent") || "",
      },
      body: JSON.stringify({
        google_id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      }),
    });

    console.log("[AUTH] Flask response status:", upsertResponse.status);

    if (!upsertResponse.ok) {
      console.error("[AUTH] Flask upsert failed:", {
        status: upsertResponse.status,
        statusText: upsertResponse.statusText,
      });
      throw new Error(`Flask upsert failed: ${upsertResponse.status}`);
    }

    const { is_new_user, user: dbUser } = await upsertResponse.json();

    console.log("[AUTH] User upsert successful:", {
      email: dbUser.email,
      db_id: dbUser.id,
      is_new_user,
    });

    // Create user object with database info + additional fields
    const user = {
      id: dbUser.id, // Use database ID instead of Google ID
      google_id: dbUser.google_id,
      name: dbUser.name,
      email: dbUser.email,
      picture: dbUser.picture,
      is_new_user,
      joinDate: new Date(dbUser.created_at).toISOString().split("T")[0],
      currentLevel: "Beginner",
      totalStudyTime: "0 hours",
      streakDays: 0,
      totalWordsLearned: 0,
      favoriteModules: ["Hiragana", "Basic Words", "Common Phrases"],
    };

    // Create session cookie and redirect
    const response = NextResponse.redirect(new URL(redirectUrl, getBaseUrl()));

    // Set secure HTTP-only cookie with user session
    // Forward the session cookie from Flask backend
    const setCookieHeader = upsertResponse.headers.get("set-cookie");
    if (setCookieHeader) {
      // Split potentially multiple cookies (though Flask usually sends one session cookie here)
      // and append them to the response
      const serverCookies = setCookieHeader.split(/,(?=\s*[^;]+=[^;]+)/);
      serverCookies.forEach(cookie => {
        response.headers.append("Set-Cookie", cookie.trim());
      });
    }

    return response;
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(new URL("/auth/login", getBaseUrl()));
  }

}