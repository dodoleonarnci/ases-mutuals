import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { parseJsonRequest } from "@/lib/api-helpers";
import { deriveStudentIdentifier } from "@/lib/identifiers";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { formatZodError, signupInsertSchema } from "@/lib/validators";
import { getStudentNamesFromCSV } from "@/lib/studentData";
import { setSession } from "@/lib/session";
import { validateApiKey } from "@/lib/api-auth";

export async function GET(request: Request) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { data, error } = await createServiceRoleClient()
    .from("signups")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ signups: data }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const parseResult = await parseJsonRequest(request);
    if (parseResult.error) {
      return parseResult.error;
    }
    const payload = parseResult.data;

    const parsed = signupInsertSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 422 },
      );
    }

    const instagramHandle = parsed.data.instagram_handle
      ? parsed.data.instagram_handle.startsWith("@")
        ? parsed.data.instagram_handle
        : `@${parsed.data.instagram_handle}`
      : null;

    const normalized = {
      email: parsed.data.email.trim().toLowerCase(),
      password_hash: await bcrypt.hash(parsed.data.password, 10),
      phone: parsed.data.phone ?? null,
      instagram_handle: instagramHandle,
    };
    const studentId = deriveStudentIdentifier(normalized.email);

    // Look up user_id from the student names CSV file
    const studentNames = getStudentNamesFromCSV();
    const matchedStudent = studentNames.find(
      (s) => s.email.toLowerCase() === normalized.email
    );
    const userId = matchedStudent?.user_id || null;

    const client = createServiceRoleClient();

    // Check if signup already exists with this email
    const { data: existingSignup, error: signupCheckError } = await client
      .from("signups")
      .select("email")
      .eq("email", normalized.email)
      .maybeSingle();

    if (signupCheckError && signupCheckError.code !== "PGRST116") {
      return NextResponse.json({ error: signupCheckError.message }, { status: 500 });
    }

    if (existingSignup) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 },
      );
    }

    // Insert new signup
    const { error: insertError } = await client.from("signups").insert(normalized);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { data: existingStudent, error: existingError } = await client
      .from("students")
      .select("*")
      .eq("email", normalized.email)
      .maybeSingle();

    if (existingError && existingError.code !== "PGRST116") {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (existingStudent) {
      // Update user_id if it's missing and we found it in the CSV
      if (!existingStudent.user_id && userId) {
        await client
          .from("students")
          .update({ user_id: userId })
          .eq("id", existingStudent.id);
        existingStudent.user_id = userId;
      }
      // Set session cookie
      await setSession({
        studentId: existingStudent.id,
        email: existingStudent.email,
      });
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

    // Set session cookie
    await setSession({
      studentId: student.id,
      email: student.email,
    });

    return NextResponse.json(
      { student, surveyPath: `/survey?studentId=${student.id}` },
      { status: 201 },
    );
  } catch (error) {
    // Ensure we always return JSON, even for unexpected errors
    console.error("Unexpected error in signup POST:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "An unexpected error occurred. Please try again." 
      },
      { status: 500 }
    );
  }
}


