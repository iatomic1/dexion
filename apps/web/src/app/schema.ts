import { z } from "zod";

export const baseAuthSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
  // password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = baseAuthSchema;
export const signUpSchema = baseAuthSchema;

// Fix: Use .extend() instead of spreading .shape
export const authSchema = z.discriminatedUnion("signUp", [
  baseAuthSchema.extend({
    signUp: z.literal(true),
  }),
  baseAuthSchema.extend({
    signUp: z.literal(false),
  }),
]);

export type AuthSchema =
  | z.infer<typeof signUpSchema>
  | z.infer<typeof loginSchema>;
