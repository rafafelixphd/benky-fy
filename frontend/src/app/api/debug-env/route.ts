import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/utils/api-utils";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    node_env: process.env.NODE_ENV,
    next_public_api_base_url: process.env.NEXT_PUBLIC_API_BASE_URL,
    computed_base_url: getBaseUrl(),
    google_client_id_prefix: process.env.GOOGLE_OAUTH_CLIENT_ID ? 
      `${process.env.GOOGLE_OAUTH_CLIENT_ID.substring(0, 15)}...` : 'undefined',
  });
}
