import { NextResponse } from "next/server";

import { parseJsonRequest } from "@/lib/api-helpers";
import { deriveStudentIdentifier } from "@/lib/identifiers";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { formatZodError, studentInsertSchema } from "@/lib/validators";
import { validateApiKey } from "@/lib/api-auth";

export async function GET(request: Request) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { data, error } = await createServiceRoleClient()
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ students: data }, { status: 200 });
}

export async function POST(request: Request) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const parseResult = await parseJsonRequest(request);
  if (parseResult.error) {
    return parseResult.error;
  }
  const payload = parseResult.data;

  const parsed = studentInsertSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: formatZodError(parsed.error) },
      { status: 422 },
    );
  }

  const normalized = {
    ...parsed.data,
    id: deriveStudentIdentifier(parsed.data.email),
    grad_year: parsed.data.grad_year ?? null,
    major: parsed.data.major ?? null,
    interests: parsed.data.interests ?? null,
  };

  const { data, error } = await createServiceRoleClient()
    .from("students")
    .insert(normalized)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ student: data }, { status: 201 });
}


