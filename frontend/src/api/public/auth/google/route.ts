// lib/auth/google-oauth.ts
import { OAuth2Client } from "google-auth-library";
import { getGoogleRedirectUri } from "@/lib/utils/api-utils";

if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
  throw new Error("GOOGLE_OAUTH_CLIENT_ID is not set");
}
if (!process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
  throw new Error("GOOGLE_OAUTH_CLIENT_SECRET is not set");
}

let oauthClient: OAuth2Client | null = null;

export function getGoogleOAuthClient(): OAuth2Client {
  if (!oauthClient) {
    oauthClient = new OAuth2Client(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      getGoogleRedirectUri()
    );
  }
  return oauthClient;
}

export function getGoogleAuthUrl(): string {
  const client = getGoogleOAuthClient();
  
  return client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
  });
}