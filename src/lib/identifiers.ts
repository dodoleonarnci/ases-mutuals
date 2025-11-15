import { z } from "zod";

export const STUDENT_IDENTIFIER_PATTERN = /^[a-z0-9._-]+$/i;

export const studentIdentifierSchema = z
  .string()
  .min(2, "Student identifier must include at least 2 characters")
  .max(64, "Student identifier is too long")
  .regex(
    STUDENT_IDENTIFIER_PATTERN,
    "Student identifier can only include letters, numbers, dots, underscores, or hyphens",
  );

export type StudentIdentifier = z.infer<typeof studentIdentifierSchema>;

export const deriveStudentIdentifier = (email: string): StudentIdentifier => {
  const normalizedEmail = email.trim().toLowerCase();
  const [handle] = normalizedEmail.split("@");

  return studentIdentifierSchema.parse(handle ?? "");
};

export const isValidStudentIdentifier = (value: unknown): value is StudentIdentifier => {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  return (
    trimmed.length >= 2 &&
    trimmed.length <= 64 &&
    STUDENT_IDENTIFIER_PATTERN.test(trimmed)
  );
};

