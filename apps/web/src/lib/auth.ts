import { betterAuth } from "better-auth";
import {
  createAuthMiddleware,
  emailOTP,
  openAPI,
  twoFactor,
} from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db/drizzle";
import { schema, user } from "./db/schema";
import { bearer, jwt } from "better-auth/plugins";
import { sendEmail } from "./email/send";
import { reverify } from "@better-auth-kit/reverify";
import { eq } from "drizzle-orm";
import { createSubOrganization } from "./turnkey/service";
import { getAddressFromPublicKey } from "@stacks/transactions";

export const auth = betterAuth({
  appName: "Dexion Pro",
  user: {
    additionalFields: {
      inviteCode: {
        type: "string",
        required: false,
        input: true,
        unique: true,
        defaultValue: false,
      },
      subOrgCreated: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
        returned: true,
      },
      subOrganizationId: {
        type: "string",
        required: false,
        defaultValue: false,
        input: false,
        returned: true,
        unique: true,
      },
      walletId: {
        type: "string",
        required: false,
        defaultValue: false,
        input: false,
        returned: true,
        unique: true,
      },

      walletAddress: {
        type: "string",
        required: false,
        defaultValue: false,
        input: false,
        returned: true,
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
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (
        !ctx.path.includes("/email-otp/verify-email") ||
        !ctx.context.newSession
      )
        return;
      console.log(ctx.context.newSession, "from session");
      const { id, walletCreated } = ctx.context.newSession.user;

      if (!walletCreated) {
        const res = await createSubOrganization(ctx.context.newSession.user);

        await db
          .update(user)
          .set({
            subOrgCreated: true,
            subOrganizationId: res.subOrganizationId,
            walletId: res.wallet?.walletId!,
            walletAddress: getAddressFromPublicKey(
              res.wallet?.addresses[0] as string,
            ),
          })
          .where(eq(user.id, id));
      }
    }),
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
  emailVerification: {
    autoSignInAfterVerification: true,
    async onEmailVerification(user, request) {
      console.log(user, request, "from onEmailVerification");
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
