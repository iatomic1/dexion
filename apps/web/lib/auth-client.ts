import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { twoFactorClient } from "better-auth/client/plugins";
import { reverifyClient } from "@better-auth-kit/reverify/client";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3001",
  plugins: [twoFactorClient(), reverifyClient(), emailOTPClient()],
});
