import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/utils/api-utils";
import { validateGoogleSession } from "@/api/public/auth/google/callback/route";

export async function GET(request: NextRequest) {
    try {
        return await validateGoogleSession(request, "code", "/home");
    } catch (error) {
        return NextResponse.redirect(new URL("/auth/login?error=google_callback_failed", getBaseUrl()));
    }
}