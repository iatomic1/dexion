import { DOMAIN_NAME, FRONTEND_URL } from "@dexion/shared";
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
import siteConfig from "~/config/site";
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
import { walletAddressVerification } from "./plugins/wallet-address-verification";

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
			externalAddress: {
				type: "string",
				required: false,
				defaultValue: null,
				input: false,
				returned: true,
			},
		},
	},
	databaseHooks: {
		account: {
			create: {
				after: async (account, ctx) => {
					if (!ctx?.context || account.providerId !== "google") {
						return;
					}

					const sessionUser = ctx.context.session?.user;
					if (!sessionUser) {
						return;
					}

					const cachedUserData = await getCachedUserData(sessionUser.id);
					if (!cachedUserData?.email) {
						await updateCachedUserField(
							sessionUser.id,
							"email",
							sessionUser.email,
						);
					}

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
				},
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
		walletAddressVerification(),
		siws({
			domain: DOMAIN_NAME,
			emailDomainName: DOMAIN_NAME,
			getNonce: async () => {
				return generateRandomString(32);
			},
			bnsLookup: async ({ walletAddress }) => {
				try {
					const res = await getBnsAndAvatar(walletAddress);

					// Validate the response
					if (!res || typeof res !== "object") {
						throw new Error("Invalid BNS response");
					}

					return {
						name: res.name || walletAddress,
						avatar: res.avatar || "",
					};
				} catch (err) {
					// Log error for monitoring (but don't expose to client)
					console.error(`BNS lookup failed for ${walletAddress}:`, err);

					// Return safe defaults
					return {
						name: walletAddress,
						avatar: "",
					};
				}
			},
			verifyMessage: async ({
				message,
				signature,
				publicKey,
				address,
				nonce,
			}) => {
				try {
					const isValidSignature = verifyMessageSignatureRsv({
						message,
						signature,
						publicKey,
					});

					if (!isValidSignature) {
						console.error("Signature verification failed", {
							address: address?.substring(0, 10) + "...",
							signaturePrefix: signature?.substring(0, 20) + "...",
						});
						return false;
					}

					return true;
				} catch (error) {
					console.error("SIWS verification error:", {
						error: error instanceof Error ? error.message : "Unknown error",
						address: address?.substring(0, 10) + "...",
					});
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
			issuer: siteConfig.title,
			totpOptions: {
				disable: false,
			},
		}),
		nextCookies(),
	],
});
