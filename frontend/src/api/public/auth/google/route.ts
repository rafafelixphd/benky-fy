// lib/auth/google-oauth.ts
import { OAuth2Client } from "google-auth-library";

if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
  throw new Error("GOOGLE_OAUTH_CLIENT_ID is not set");
}
if (!process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
  throw new Error("GOOGLE_OAUTH_CLIENT_SECRET is not set");
}

function getRedirectUri(): string {
  if (process.env.NODE_ENV === 'production') {
    return process.env.GOOGLE_REDIRECT_URI || 'https://benkyfy.site/auth/google/callback';
  }
  return process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';
}

let oauthClient: OAuth2Client | null = null;

export function getGoogleOAuthClient(): OAuth2Client {
  if (!oauthClient) {
    oauthClient = new OAuth2Client(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      getRedirectUri()
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