import { NextResponse } from "next/server";

import { studentIdentifierSchema } from "@/lib/identifiers";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { formatZodError, studentSurveySchema } from "@/lib/validators";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Params) {
  const { id } = await context.params;
  const idResult = studentIdentifierSchema.safeParse(id?.trim());

  if (!idResult.success) {
    return NextResponse.json({ error: "Student id must be a valid identifier" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", idResult.data)
    .single();

  if (error) {
    const status = error.code === "PGRST116"
      ? 404
      : 500;

    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ student: data });
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const idResult = studentIdentifierSchema.safeParse(id?.trim());

  if (!idResult.success) {
    return NextResponse.json({ error: "Student id must be a valid identifier" }, { status: 400 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = studentSurveySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: formatZodError(parsed.error) },
      { status: 422 },
    );
  }

  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("students")
    .update({
      grad_year: parsed.data.grad_year,
      sex: parsed.data.sex,
      dorm: parsed.data.dorm,
      close_friends: parsed.data.close_friends,
      uc_berkeley_choice: parsed.data.uc_berkeley_choice,
      survey_completed: true,
    })
    .eq("id", idResult.data)
    .select()
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;

    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ student: data }, { status: 200 });
}

 