import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { formatZodError, friendshipInsertSchema } from "@/lib/validators";

const supabase = () => createServiceRoleClient();

export async function GET() {
  const { data, error } = await supabase()
    .from("friendships")
    .select("*, requester:requester_id(first_name,last_name,email), addressee:addressee_id(first_name,last_name,email)")
    .order("initiated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ friendships: data });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = friendshipInsertSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: formatZodError(parsed.error) },
      { status: 422 },
    );
  }

  const { data, error } = await supabase()
    .from("friendships")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ friendship: data }, { status: 201 });
}


