import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/services/utils/api-utils";
import { validateGoogleSession } from "@/api/public/auth/google/callback/route";

export async function GET(request: NextRequest) {
    try {
        return await validateGoogleSession(request, "code", "/dashboard");
    } catch (error) {
        return NextResponse.redirect(new URL("/auth/login?error=google_callback_failed", getBaseUrl()));
    }
}