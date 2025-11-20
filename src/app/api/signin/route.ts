import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { parseJsonRequest } from "@/lib/api-helpers";
import { formatZodError, signinSchema } from "@/lib/validators";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { setSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const parseResult = await parseJsonRequest(request);
    if (parseResult.error) {
      return parseResult.error;
    }

    const payload = parseResult.data;
    const parsed = signinSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 422 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;

    const client = createServiceRoleClient();

    const { data: signupRecord, error: signupError } = await client
      .from("signups")
      .select("email, password_hash")
      .eq("email", email)
      .maybeSingle();

    if (signupError && signupError.code !== "PGRST116") {
      return NextResponse.json({ error: signupError.message }, { status: 500 });
    }

    if (!signupRecord || !signupRecord.password_hash) {
      return NextResponse.json({ error: "No account found for that email." }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, signupRecord.password_hash);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const { data: student, error: studentError } = await client
      .from("students")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (studentError && studentError.code !== "PGRST116") {
      return NextResponse.json({ error: studentError.message }, { status: 500 });
    }

    if (!student) {
      return NextResponse.json(
        { error: "We couldn't find a student profile for that account." },
        { status: 404 },
      );
    }

    // Set session cookie
    await setSession({
      studentId: student.id,
      email: student.email,
    });

    return NextResponse.json(
      { student, surveyPath: `/survey?studentId=${student.id}` },
      { status: 200 },
    );
  } catch (error) {
    console.error("Unexpected error in signin POST:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
      },
      { status: 500 },
    );
  }
}

