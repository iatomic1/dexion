// import { reverify } from "@better-auth-kit/reverify";

import { getAddressFromPublicKey } from "@stacks/transactions";
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
import { sendEmailWithTrigger } from "~/trigger/send-email";
import type { EmailType } from "~/types/email";
import { db } from "./db/drizzle";
import { schema, user } from "./db/schema";
import { createSubOrganization } from "./turnkey/service";
import { handleEmailSendingImmediate } from "./utils/email";

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
			const userFromSession = ctx.context.newSession.user;
			console.log(userFromSession);
			if (userFromSession.emailVerified) {
				console.log("reach here");
				// Use Created values for testing for now
				// if (email === process.env.TEST_EMAIL) {
				// 	await db
				// 		.update(user)
				// 		.set({
				// 			subOrgCreated: true,
				// 			subOrganizationId: process.env.TEST_SUB_ORG_ID,
				// 			walletAddress: process.env.TEST_WALLET_ADDRESS,
				// 			walletId: process.env.TEST_WALLET_ID,
				// 			walletPublicKey: process.env.TEST_WALLET_PUBLIC_KEY,
				// 		})
				// 		.where(eq(user.id, id));
				// }
				const res = await createSubOrganization(userFromSession);
				console.log(res);
				await db
					.update(user)
					.set({
						subOrgCreated: true,
						subOrganizationId: res.subOrganizationId,
						walletId: res.wallet?.walletId!,
						walletAddress: getAddressFromPublicKey(
							res.wallet?.addresses[0] as string,
						),
						walletPublicKey: res.wallet?.addresses[0] as string,
					})
					.where(eq(user.id, userFromSession.id));
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
			try {
				await handleEmailSendingImmediate(user.email, "forget-password", url);
			} catch (error) {
				console.error("Failed to send reset password email:", error);
				// Re-throw to let better-auth handle the error
				throw new Error("Failed to send reset password email");
			}
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
				try {
					await handleEmailSendingImmediate(email, type, otp);
				} catch (error) {
					console.error("Failed to send verification OTP:", error);
					// Re-throw to let better-auth handle the error
					throw new Error("Failed to send verification OTP");
				}
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
					try {
						await handleEmailSendingImmediate(user.email, "sign-in", data.otp);
					} catch (error) {
						console.error("Failed to send 2FA OTP:", error);
						// Re-throw to let better-auth handle the error
						throw new Error("Failed to send 2FA OTP");
					}
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
