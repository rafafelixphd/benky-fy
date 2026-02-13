import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { getBaseUrl } from "@/lib/utils/api-utils";

const client = new OAuth2Client(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  `${getBaseUrl()}/auth/google/callback`
);

export async function getGoogleAuthUrl() {
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
  });
  return authUrl;
}

export async function GET() {
  console.log("[DEBUG] Google OAuth Flow Start");
  console.log("[DEBUG] NEXT_PUBLIC_API_BASE_URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
  console.log("[DEBUG] Computed Base URL:", getBaseUrl());
  console.log("[DEBUG] Callback URL:", `${getBaseUrl()}/auth/google/callback`);
  
  const authUrl = await getGoogleAuthUrl();
  console.log("[DEBUG] Generated Auth URL:", authUrl);
  
  return NextResponse.redirect(authUrl);
}