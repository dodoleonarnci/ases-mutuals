import { z } from "zod";

import { studentIdentifierSchema } from "@/lib/identifiers";
import type { FriendshipStatus, MatchStatus } from "@/types/domain";

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
});

export const studentSurveySchema = z.object({
  grad_year: z.number().int().min(2024).max(2030),
  sex: z.enum(["male", "female", "non-binary"]),
  major: z.string().min(1, "Please select your major category"),
  dorm: z.string().min(1, "Dorm is required"),
  hobbies: z.array(z.string().min(1)).min(1).max(10),
  involvements: z.string().min(3, "Tell us about at least one involvement"),
  close_friends: z.array(z.string().min(1)).min(5).max(20),
});

export const friendshipInsertSchema = z
  .object({
    requester_id: studentIdentifierSchema,
    addressee_id: studentIdentifierSchema,
    status: z
      .enum(["pending", "accepted", "rejected"] satisfies FriendshipStatus[])
      .default("pending"),
  })
  .refine(
    (data) => data.requester_id !== data.addressee_id,
    "requester_id and addressee_id must be different",
  );

export const matchInsertSchema = z
  .object({
    student_a_id: studentIdentifierSchema,
    student_b_id: studentIdentifierSchema,
    friendship_id: z.string().uuid().nullable().optional(),
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
export type FriendshipInsert = z.infer<typeof friendshipInsertSchema>;
export type MatchInsert = z.infer<typeof matchInsertSchema>;

export const formatZodError = (error: z.ZodError) =>
  error.issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`);

 