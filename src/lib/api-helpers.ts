import { NextResponse } from "next/server";

/**
 * Parses JSON from a request body with consistent error handling.
 * @returns An object with either `data` and `error: null`, or `data: null` and an `error` NextResponse
 */
export async function parseJsonRequest(
  request: Request,
): Promise<{ data: unknown; error: null } | { data: null; error: NextResponse }> {
  try {
    const data = await request.json();
    return { data, error: null };
  } catch {
    return {
      data: null,
      error: NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 }),
    };
  }
}

