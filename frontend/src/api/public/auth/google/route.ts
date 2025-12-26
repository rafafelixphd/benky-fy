import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { getBaseUrl } from "@/core/api-utils";

const client = new OAuth2Client(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  `${getBaseUrl()}/api/auth/google/callback`
);

export async function GET() {
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
  });

  return NextResponse.redirect(authUrl);
}