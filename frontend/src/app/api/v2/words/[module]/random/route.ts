import { NextResponse } from "next/server";
import { fetchFromBackend } from "@/core/api-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ module: string }> },
) {
  try {
    const { module } = await params;
    const data = await fetchFromBackend(`/v2/words/${module}/random`);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching random word from backend:`, error);
    return NextResponse.json(
      { error: `Failed to fetch random word` },
      { status: 500 },
    );
  }
}
