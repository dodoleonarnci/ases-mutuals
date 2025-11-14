import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { formatZodError, signupInsertSchema } from "@/lib/validators";

const supabase = () => createServiceRoleClient();

export async function GET() {
  const { data, error } = await supabase()
    .from("signups")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ signups: data }, { status: 200 });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = signupInsertSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: formatZodError(parsed.error) },
      { status: 422 },
    );
  }

  const normalized = {
    email: parsed.data.email.trim().toLowerCase(),
  };

  const { data, error } = await supabase()
    .from("signups")
    .insert(normalized)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ signup: data }, { status: 201 });
}


