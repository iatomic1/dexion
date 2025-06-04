import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db/drizzle";
import { schema } from "./db/schema";
import { bearer, jwt } from "better-auth/plugins";

export const auth = betterAuth({
  user: {
    additionalFields: {
      type: {
        type: "string",
        fieldName: "type",
        returned: true,
        required: true,
        defaultValue: "APP",
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    account: {
      accountLinking: {
        enabled: true,
      },
    },
    minPasswordLength: 4,
  },
  plugins: [
    bearer(),
    jwt({
      jwt: {
        expirationTime: "15m",
      },
    }),
    nextCookies(),
  ],
});
