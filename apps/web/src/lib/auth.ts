import { betterAuth } from "better-auth";
import { emailOTP, openAPI, twoFactor } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db/drizzle";
import { schema } from "./db/schema";
import { bearer, jwt } from "better-auth/plugins";
import { sendEmail } from "./email/send";
import { reverify } from "@better-auth-kit/reverify";

export const auth = betterAuth({
  appName: "Dexion Pro",
  user: {
    additionalFields: {
      inviteCode: {
        type: "string",
        required: false,
        input: false,
        unique: true,
        defaultValue: false,
      },
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
  account: { accountLinking: { enabled: true } },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: true,
    minPasswordLength: 4,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail(user.email, "forget-password", url);
    },
  },

  plugins: [
    openAPI(),
    reverify(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log(`Sending OTP ${otp} to ${email} for ${type}`);
        await sendEmail(email, type, otp);
      },
      expiresIn: 300,
      otpLength: 6,
      disableSignUp: true,
      sendVerificationOnSignUp: true,
    }),
    bearer(),
    jwt({
      jwt: {
        expirationTime: "15m",
      },
    }),
    twoFactor({
      otpOptions: {
        async sendOTP(data) {
          const user = data.user;
          await sendEmail(user.email, "sign-in", data.otp);
        },
        digits: 6,
      },
      totpOptions: {
        disable: false,
      },
    }),
    nextCookies(),
  ],
});
