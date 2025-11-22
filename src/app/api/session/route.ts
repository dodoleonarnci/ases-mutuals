import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateApiKey } from "@/lib/api-auth";

export async function GET(request: Request) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const session = await getSession();

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  // Verify the student still exists
  const client = createServiceRoleClient();
  const { data: student, error } = await client
    .from("students")
    .select("id, email")
    .eq("id", session.studentId)
    .maybeSingle();

  if (error || !student) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json(
    {
      authenticated: true,
      student: {
        id: student.id,
        email: student.email,
      },
    },
    { status: 200 },
  );
}

