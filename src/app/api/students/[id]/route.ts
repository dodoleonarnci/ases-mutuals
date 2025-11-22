import { NextResponse } from "next/server";

import { parseJsonRequest } from "@/lib/api-helpers";
import { studentIdentifierSchema } from "@/lib/identifiers";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { formatZodError, studentSurveySchema } from "@/lib/validators";
import { validateApiKey } from "@/lib/api-auth";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: Params) {
  const authError = validateApiKey(request);
  if (authError) return authError;

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
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { id } = await context.params;
  const idResult = studentIdentifierSchema.safeParse(id?.trim());

  if (!idResult.success) {
    return NextResponse.json({ error: "Student id must be a valid identifier" }, { status: 400 });
  }

  const parseResult = await parseJsonRequest(request);
  if (parseResult.error) {
    return parseResult.error;
  }
  const payload = parseResult.data;

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
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
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

 