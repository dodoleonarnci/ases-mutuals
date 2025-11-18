import { NextResponse } from "next/server";

import { deriveStudentIdentifier } from "@/lib/identifiers";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { formatZodError, signupInsertSchema } from "@/lib/validators";
import studentNamesData from "@/data/studentNames.json";

interface StudentData {
  first_name: string;
  last_name: string;
  email: string;
  user_id: string;
}

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
  const studentId = deriveStudentIdentifier(normalized.email);

  // Look up user_id from the student names JSON file
  const studentNames = studentNamesData as StudentData[];
  const matchedStudent = studentNames.find(
    (s) => s.email.toLowerCase() === normalized.email
  );
  const userId = matchedStudent?.user_id || null;

  const client = supabase();

  await client.from("signups").upsert(normalized, {
    onConflict: "email",
  });

  const { data: existingStudent, error: existingError } = await client
    .from("students")
    .select("*")
    .eq("email", normalized.email)
    .maybeSingle();

  if (existingError && existingError.code !== "PGRST116") {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existingStudent) {
    // Update user_id if it's missing and we found it in the JSON
    if (!existingStudent.user_id && userId) {
      await client
        .from("students")
        .update({ user_id: userId })
        .eq("id", existingStudent.id);
      existingStudent.user_id = userId;
    }
    return NextResponse.json(
      { student: existingStudent, surveyPath: `/survey?studentId=${existingStudent.id}` },
      { status: 200 },
    );
  }

  const { data: student, error } = await client
    .from("students")
    .insert({ id: studentId, email: normalized.email, user_id: userId })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { student, surveyPath: `/survey?studentId=${student.id}` },
    { status: 201 },
  );
}


