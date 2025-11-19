import { NextResponse } from "next/server";

import { parseJsonRequest } from "@/lib/api-helpers";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { formatZodError, matchInsertSchema } from "@/lib/validators";

export async function GET() {
  const { data, error } = await createServiceRoleClient()
    .from("matches")
    .select(
      "*, student_a:student_a_id(first_name,last_name,email), student_b:student_b_id(first_name,last_name,email)",
    )
    .order("matched_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ matches: data });
}

export async function POST(request: Request) {
  const parseResult = await parseJsonRequest(request);
  if (parseResult.error) {
    return parseResult.error;
  }
  const payload = parseResult.data;

  const parsed = matchInsertSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: formatZodError(parsed.error) },
      { status: 422 },
    );
  }

  const { data, error } = await createServiceRoleClient()
    .from("matches")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ match: data }, { status: 201 });
}


