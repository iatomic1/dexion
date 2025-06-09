import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { twoFactorClient } from "better-auth/client/plugins";
import { reverifyClient } from "@better-auth-kit/reverify/client";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3001",
  plugins: [
    inferAdditionalFields({
      user: {
        inviteCode: {
          type: "string",
          required: false,
        },
      },
    }),
    twoFactorClient(),
    reverifyClient(),
    emailOTPClient(),
  ],
});
