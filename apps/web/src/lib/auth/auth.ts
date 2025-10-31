import { DOMAIN_NAME, FRONTEND_URL } from "@repo/shared-constants/constants.ts";
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
	oneTimeToken,
	openAPI,
	twoFactor,
} from "better-auth/plugins";
import type { User } from "~/types/auth";
import { db } from "../db/drizzle";
import {
	getCachedUserData,
	redisStorage,
	updateCachedUserField,
} from "../db/redis";
import { schema } from "../db/schema";
import { getBnsAndAvatar } from "../queries/bns";
import { handleEmailSendingImmediate } from "../utils/email";
import { initWallet } from "./init-wallet";
import { siws } from "./plugins/siws";
import { getTelegramPlugin } from "./plugins/telegram/import";

const URL =
	process.env.NODE_ENV === "production"
		? `https://${DOMAIN_NAME}`
		: "http://localhost:3001";
const NGROK_PERSONAL_DOMAIN =
	"https://unhuntable-kristofer-unresident.ngrok-free.dev";
export const auth = betterAuth({
	appName: "Dexion Pro",
	trustedOrigins: [
		FRONTEND_URL,
		`https://beta.${DOMAIN_NAME}`,
		URL,
		NGROK_PERSONAL_DOMAIN,
	],
	baseURL: URL,
	user: {
		additionalFields: {
			inviteCode: {
				type: "string",
				required: false,
				input: true,
				unique: true,
				defaultValue: null,
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
				defaultValue: null,
				input: false,
				returned: true,
				unique: true,
			},
			walletId: {
				type: "string",
				required: false,
				defaultValue: null,
				input: false,
				returned: true,
				unique: true,
			},
			walletAddress: {
				type: "string",
				required: false,
				defaultValue: null,
				input: false,
				returned: true,
			},
			walletPublicKey: {
				type: "string",
				required: false,
				defaultValue: null,
				input: false,
				returned: true,
			},
		},
	},

	secondaryStorage: redisStorage,
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			if (
				ctx.path.includes("/email-otp/verify-email") &&
				ctx.context.newSession
			) {
				const sessionUser = ctx.context.newSession.user;
				const cachedUserData = await getCachedUserData(sessionUser.id);
				if (!cachedUserData?.email)
					await updateCachedUserField(
						sessionUser.id,
						"email",
						sessionUser.email,
					);

				const userFromSession: User = {
					...sessionUser,
					inviteCode: sessionUser.inviteCode ?? null,
					subOrgCreated: sessionUser.subOrgCreated ?? false,
					subOrganizationId: sessionUser.subOrganizationId ?? undefined,
					walletId: sessionUser.walletId ?? "",
					walletAddress: sessionUser.walletAddress ?? "",
					walletPublicKey: sessionUser.walletPublicKey ?? "",
					twoFactorEnabled: sessionUser.twoFactorEnabled ?? false,
				};
				await initWallet(userFromSession, true);
			}
			if (ctx.path.includes("/sign-in/social") && ctx.context.newSession) {
				const sessionUser = ctx.context.newSession.user;
				const cachedUserData = await getCachedUserData(sessionUser.id);
				if (!cachedUserData?.email)
					await updateCachedUserField(
						sessionUser.id,
						"email",
						sessionUser.email,
					);

				const userFromSession: User = {
					...sessionUser,
					inviteCode: sessionUser.inviteCode ?? null,
					subOrgCreated: sessionUser.subOrgCreated ?? false,
					subOrganizationId: sessionUser.subOrganizationId ?? undefined,
					walletId: sessionUser.walletId ?? "",
					walletAddress: sessionUser.walletAddress ?? "",
					walletPublicKey: sessionUser.walletPublicKey ?? "",
					twoFactorEnabled: sessionUser.twoFactorEnabled ?? false,
				};
				await initWallet(userFromSession, false);
			}
			if (ctx.path.includes("/sign-in/email") && ctx.context.newSession) {
				const sessionUser = ctx.context.newSession.user;
				const cachedUserData = await getCachedUserData(sessionUser.id);
				if (!cachedUserData?.email)
					await updateCachedUserField(
						sessionUser.id,
						"email",
						sessionUser.email,
					);
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
			allowDifferentEmails: false,
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		autoSignIn: true,
		minPasswordLength: 8,
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
		...(getTelegramPlugin() ? [getTelegramPlugin()!] : []),
		openAPI(),
		oneTimeToken({
			expiresIn: 5,
		}),
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
				audience: URL,
				issuer: URL,
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
