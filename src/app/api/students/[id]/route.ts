import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/server";

type Params = {
  params: { id: string };
};

export async function GET(_: Request, { params }: Params) {
  const { id } = params;
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    const status = error.code === "PGRST116"
      ? 404
      : 500;

    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ student: data });
}


