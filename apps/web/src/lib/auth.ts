// import { reverify } from "@better-auth-kit/reverify";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
	bearer,
	createAuthMiddleware,
	emailOTP,
	jwt,
	openAPI,
	twoFactor,
} from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { db } from "./db/drizzle";
import { schema, user } from "./db/schema";
import { sendEmail } from "./email/send";

export const auth = betterAuth({
	appName: "Dexion Pro",
	trustedOrigins: [],
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
			walletPublicKey: {
				type: "string",
				required: false,
				defaultValue: false,
				input: false,
				returned: true,
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
			const { emailVerified, id, email } = ctx.context.newSession.user;

			if (emailVerified) {
				// Use Created values for testing for now
				if (email === process.env.TEST_EMAIL) {
					await db
						.update(user)
						.set({
							subOrgCreated: true,
							subOrganizationId: process.env.TEST_SUB_ORG_ID,
							walletAddress: process.env.TEST_WALLET_ADDRESS,
							walletId: process.env.TEST_WALLET_ID,
							walletPublicKey: process.env.TEST_WALLET_PUBLIC_KEY,
						})
						.where(eq(user.id, id));
				}

				// const res = await createSubOrganization(ctx.context.newSession.user);
				// await db
				//   .update(user)
				//   .set({
				//     subOrgCreated: true,
				//     subOrganizationId: res.subOrganizationId,
				//     walletId: res.wallet?.walletId!,
				//     walletAddress: getAddressFromPublicKey(
				//       res.wallet?.addresses[0] as string,
				//     ),
				//     walletPublicKey: res.wallet?.addresses[0] as string,
				//   })
				//   .where(eq(user.id, id));
			}
		}),
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
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
		revokeSessionsOnPasswordReset: true,
		resetPasswordTokenExpiresIn: 10 * 60,
	},
	emailVerification: {
		autoSignInAfterVerification: true,
		async onEmailVerification(user, request) {
			console.log(user, request, "from onEmailVerification");
		},
	},

	plugins: [
		openAPI(),
		// reverify(),
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
