// schema.ts
import { z } from "zod";

const baseAuthSchema = {
  email: z.string().email("Invalid email address"),
  password: z.string(),
  // password: z.string().min(8, "Password must be at least 8 characters"),
};

export const loginSchema = z.object(baseAuthSchema);
export const signUpSchema = z.object(baseAuthSchema);

export const authSchema = z.discriminatedUnion("signUp", [
  z.object({ signUp: z.literal(true), ...signUpSchema.shape }),
  z.object({ signUp: z.literal(false), ...loginSchema.shape }),
]);

export type AuthSchema =
  | z.infer<typeof signUpSchema>
  | z.infer<typeof loginSchema>;
