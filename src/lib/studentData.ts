import { readFileSync } from "node:fs";
import { join } from "node:path";
import { deriveStudentIdentifier } from "@/lib/identifiers";

export interface StudentData {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  user_id: string;
}

/**
 * Reads student data from the CSV file and returns it in the same format
 * as the previous JSON file for backward compatibility.
 */
export function getStudentNamesFromCSV(): StudentData[] {
  const csvPath = join(process.cwd(), "src", "data", "stanford_undergraduates.csv");
  const csvContent = readFileSync(csvPath, "utf-8");
  
  const lines = csvContent.split("\n").filter((line) => line.trim());
  const headers = lines[0]?.split(",").map((h) => h.trim()) ?? [];
  
  // Find column indices
  const firstNameIndex = headers.indexOf("first_name");
  const middleNameIndex = headers.indexOf("middle_name");
  const lastNameIndex = headers.indexOf("last_name");
  const emailIndex = headers.indexOf("email");
  
  if (
    firstNameIndex === -1 ||
    lastNameIndex === -1 ||
    emailIndex === -1
  ) {
    throw new Error("CSV file is missing required columns: first_name, last_name, email");
  }
  
  const students: StudentData[] = [];
  
  // Parse each data row (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Handle CSV parsing - split by comma but respect quoted fields
    const values = parseCSVLine(line);
    
    const firstName = values[firstNameIndex]?.trim() ?? "";
    const middleName = middleNameIndex !== -1 ? values[middleNameIndex]?.trim() ?? "" : "";
    const lastName = values[lastNameIndex]?.trim() ?? "";
    const email = values[emailIndex]?.trim().toLowerCase() ?? "";
    
    if (!email) continue; // Skip rows without email
    
    // Generate user_id from email (extract part before @)
    const user_id = deriveStudentIdentifier(email);
    
    students.push({
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      email,
      user_id,
    });
  }
  
  return students;
}

/**
 * Simple CSV line parser that handles quoted fields.
 * For more complex CSV files, consider using a library like papaparse.
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  
  // Add the last field
  values.push(current);
  
  return values;
}

