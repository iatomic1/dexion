import { betterAuth } from "better-auth";
// import { APIError } from "better-auth/api";
import {
  // createAuthMiddleware,
  emailOTP,
  openAPI,
  twoFactor,
} from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db/drizzle";
import { schema } from "./db/schema";
import { bearer, jwt } from "better-auth/plugins";
import { sendEmail } from "./email/send";
import { reverify } from "@better-auth-kit/reverify";

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
  // hooks: {
  //   before: createAuthMiddleware(async (ctx) => {
  //     // Only apply this logic to email signup
  //     if (ctx.path !== "/sign-up/email") {
  //       return;
  //     }
  //
  //     const { email } = ctx.body;
  //
  //     // Check if user already exists
  //     const existingUser =
  //       await ctx.context.internalAdapter.findUserByEmail(email);
  //
  //     if (existingUser) {
  //       const user = existingUser.user;
  //       // User exists - check if they're verified
  //       if (user.emailVerified) {
  //         // User is verified, throw normal error
  //         throw new APIError("BAD_REQUEST", {
  //           message: "User already exists and is verified",
  //         });
  //       } else {
  //         // User exists but not verified - throw error with user status info
  //         throw new APIError("CONFLICT", {
  //           message: "User exists but email not verified",
  //           code: "EMAIL_NOT_VERIFIED",
  //           user: {
  //             id: user.id,
  //             email: user.email,
  //             name: user.name,
  //             emailVerified: user.emailVerified,
  //           },
  //         });
  //       }
  //     }
  //
  //     return;
  //   }),
  // },

  account: { accountLinking: { enabled: true } },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: true,
    minPasswordLength: 4,
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
        async sendOTP(data, request) {
          const user = data.user;
          await sendEmail(user.email, "sign-in", data.otp);
        },
        digits: 6,
      },
      // skipVerificationOnEnable: true,
    }),
    nextCookies(),
  ],
});
