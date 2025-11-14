import { z } from "zod";

import type { FriendshipStatus, MatchStatus } from "@/types/domain";

export const studentInsertSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Email must be valid"),
  grad_year: z.number().int().min(2020).max(2035).optional(),
  major: z.string().min(1).optional(),
  interests: z.array(z.string().min(1)).optional(),
});

export const signupInsertSchema = z.object({
  email: z.string().email("Email must be valid"),
});

export const friendshipInsertSchema = z
  .object({
    requester_id: z.string().uuid(),
    addressee_id: z.string().uuid(),
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
    student_a_id: z.string().uuid(),
    student_b_id: z.string().uuid(),
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
export type FriendshipInsert = z.infer<typeof friendshipInsertSchema>;
export type MatchInsert = z.infer<typeof matchInsertSchema>;

export const formatZodError = (error: z.ZodError) =>
  error.issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`);


