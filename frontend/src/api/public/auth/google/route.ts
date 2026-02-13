// lib/auth/google-oauth.ts
import { OAuth2Client } from "google-auth-library";

// Validate env vars at startup
if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
  throw new Error("GOOGLE_OAUTH_CLIENT_ID is not set");
}
if (!process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
  throw new Error("GOOGLE_OAUTH_CLIENT_SECRET is not set");
}

// Get redirect URI based on environment
function getRedirectUri(): string {
  // Production
  if (process.env.NODE_ENV === 'production') {
    return process.env.GOOGLE_REDIRECT_URI || 'https://benkyfy.site/auth/google/callback';
  }
  
  // Development
  return process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';
}

// Singleton OAuth client
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
    // Optional: add state for CSRF protection
    state: generateStateToken(), // Implement this for security
  });
}

// Helper for CSRF protection
function generateStateToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}