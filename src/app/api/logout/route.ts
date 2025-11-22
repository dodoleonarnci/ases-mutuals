import { NextResponse } from "next/server";

import { clearSession } from "@/lib/session";
import { validateApiKey } from "@/lib/api-auth";

export async function POST(request: Request) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  await clearSession();
  return NextResponse.json({ success: true }, { status: 200 });
}

