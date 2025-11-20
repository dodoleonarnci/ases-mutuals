import { z } from "zod";

import { studentIdentifierSchema } from "@/lib/identifiers";
import type { MatchStatus } from "@/types/domain";

const stanfordEmailSchema = z
  .string()
  .email("Email must be valid")
  .refine(
    (value) => value.toLowerCase().endsWith("@stanford.edu"),
    "Email must be a stanford.edu address",
  );

export const studentInsertSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: stanfordEmailSchema,
  grad_year: z.number().int().min(2020).max(2035).optional(),
  major: z.string().min(1).optional(),
  interests: z.array(z.string().min(1)).optional(),
});

export const signupInsertSchema = z.object({
  email: stanfordEmailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s()+\-]{7,20}$/, "Phone must be 7-20 digits and can include +, -, ()")
    .optional(),
  instagram_handle: z
    .string()
    .trim()
    .regex(/^@?[A-Za-z0-9._]{1,30}$/, "Instagram handle must be 1-30 letters, numbers, . or _")
    .optional(),
});

export const signinSchema = z.object({
  email: stanfordEmailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const studentSurveySchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  grad_year: z.number().int().min(2024).max(2030),
  sex: z.enum(["male", "female", "non-binary"]),
  dorm: z.string().min(1, "Dorm is required"),
  close_friends: z.array(z.string().min(1)).min(5),
  uc_berkeley_choice: z.enum(["no_friends", "uc_berkeley"]),
});

export const matchInsertSchema = z
  .object({
    student_a_id: studentIdentifierSchema,
    student_b_id: studentIdentifierSchema,
    compatibility_score: z.number().min(0).max(100).default(0),
    status: z
      .enum(["proposed", "active", "inactive"] satisfies MatchStatus[])
      .default("proposed"),
  })
  .refine(
    (data) => data.student_a_id !== data.student_b_id,
    "student_a_id and student_b_id must be different",
  );

export type StudentInsert = z.infer<typeof studentInsertSchema>;
export type SignupInsert = z.infer<typeof signupInsertSchema>;
export type StudentSurvey = z.infer<typeof studentSurveySchema>;
export type MatchInsert = z.infer<typeof matchInsertSchema>;

export const formatZodError = (error: z.ZodError) =>
  error.issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`);

 