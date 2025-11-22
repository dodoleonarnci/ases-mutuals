import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateApiKey } from "@/lib/api-auth";

export async function GET(request: Request) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { count, error } = await createServiceRoleClient()
    .from("signups")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count: count ?? 0 }, { status: 200 });
}

