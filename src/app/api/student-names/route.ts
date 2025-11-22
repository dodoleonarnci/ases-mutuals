import { NextResponse } from "next/server";
import { getStudentNamesFromCSV } from "@/lib/studentData";
import { validateApiKey } from "@/lib/api-auth";

export async function GET(request: Request) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const studentNames = getStudentNamesFromCSV();
    return NextResponse.json({ studentNames }, { status: 200 });
  } catch (error) {
    console.error("Error reading student names from CSV:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to read student names" 
      },
      { status: 500 }
    );
  }
}

