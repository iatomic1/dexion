import { DOMAIN_NAME } from "@repo/shared-constants/constants.ts";
import { verifyMessageSignatureRsv } from "@stacks/encryption";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { generateRandomString } from "better-auth/crypto";
import { nextCookies } from "better-auth/next-js";
import {
	bearer,
	createAuthMiddleware,
	emailOTP,
	jwt,
	openAPI,
	twoFactor,
} from "better-auth/plugins";
import { createClient } from "redis";
import type { EmailType } from "~/types/email";
import { db } from "../db/drizzle";
import { schema, user } from "../db/schema";
import { getBnsAndAvatar } from "../queries/bns";
import { siws } from "../sign-in-with-wallet-plugin";
import { handleEmailSendingImmediate } from "../utils/email";
import { initWallet } from "./init-wallet";

// const redis = createClient();
// await redis.connect();
// const REDIS_PREFIX = "auth-";

export const auth: any = betterAuth({
	appName: "Dexion Pro",
	// baseURL:
	// 	process.env.NODE_ENV === "development"
	// 		? "http://localhost:3001"
	// 		: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,

	// secondaryStorage: {
	// 	get: async (key) => {
	// 		const value = await redis.get(REDIS_PREFIX + key);
	// 		return value ? value : null;
	// 	},
	// 	set: async (key, value, ttl) => {
	// 		if (ttl) await redis.set(REDIS_PREFIX + key, value, { EX: ttl });
	// 		else await redis.set(key, value);
	// 	},
	// 	delete: async (key) => {
	// 		await redis.del(REDIS_PREFIX + key);
	// 	},
	// },
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			if (
				ctx.path.includes("/email-otp/verify-email") &&
				ctx.context.newSession
			) {
				const userFromSession = ctx.context.newSession.user;
				await initWallet(userFromSession, true);
			}
			if (ctx.path.includes("/sign-in/social") && ctx.context.newSession) {
				const userFromSession = ctx.context.newSession.user;
				await initWallet(userFromSession, false);
			}
		}),
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	socialProviders: {
		google: {
			prompt: "select_account",
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			mapProfileToUser: (profile) => {
				return {
					email: profile.email,
					image: profile.picture,
					emailVerified: true,
				};
			},
		},
	},
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["email-password", "google"],
		},
	},
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
	plugins: [
		openAPI(),
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				console.log(`Sending OTP ${otp} to ${email} for ${type}`);
				try {
					await handleEmailSendingImmediate(email, type, otp);
				} catch (error) {
					console.error("Failed to send verification OTP:", error);
					throw new Error("Failed to send verification OTP");
				}
			},
			expiresIn: 300,
			otpLength: 6,
			disableSignUp: true,
			sendVerificationOnSignUp: true,
		}),
		bearer(),
		siws({
			domain: DOMAIN_NAME,
			emailDomainName: DOMAIN_NAME,
			getNonce: async () => {
				return generateRandomString(32);
			},
			bnsLookup: async ({ walletAddress }) => {
				try {
					const res = await getBnsAndAvatar(walletAddress);
					return res;
				} catch (err) {
					return {
						name: walletAddress,
						avatar: "",
					};
				}
			},
			verifyMessage: async ({ message, signature, publicKey }) => {
				try {
					const isValid = verifyMessageSignatureRsv({
						message,
						signature,
						publicKey,
					});
					return isValid;
				} catch (error) {
					console.error("SIWE verification failed:", error);
					return false;
				}
			},
		}),
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
