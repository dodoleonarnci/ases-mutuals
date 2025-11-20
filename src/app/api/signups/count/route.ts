import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  const { count, error } = await createServiceRoleClient()
    .from("signups")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count: count ?? 0 }, { status: 200 });
}

