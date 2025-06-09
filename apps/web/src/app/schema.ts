import { z } from "zod";

export const baseAuthSchema = {
  email: z.string().email("Invalid email address"),
  password: z.string(),
  // password: z.string().min(8, "Password must be at least 8 characters"),
};

export const loginSchema = z.object(baseAuthSchema);
export const signUpSchema = z.object(baseAuthSchema);

// Fix: Use .extend() instead of spreading .shape
export const authSchema = z.discriminatedUnion("signUp", [
  z.object({
    signUp: z.literal(true),
    email: z.string().email("Invalid email address"),
    password: z.string(),
  }),
  z.object({
    signUp: z.literal(false),
    email: z.string().email("Invalid email address"),
    password: z.string(),
  }),
]);

export type AuthSchema =
  | z.infer<typeof signUpSchema>
  | z.infer<typeof loginSchema>;
