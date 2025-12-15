import { NextRequest, NextResponse } from "next/server";

const getBaseUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return process.env.AUTH_BASE_URL || "https://benkyfy.site";
  }
  return process.env.AUTH_BASE_URL || "http://localhost:3000";
};

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.redirect(
      new URL("/auth/login?logout=success", getBaseUrl()),
    );

    // Clear session cookie
    response.cookies.set({
      name: "benkyfy_session",
      value: "",
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.redirect(
      new URL("/auth/login?error=logout_failed", getBaseUrl()),
    );
  }
}
