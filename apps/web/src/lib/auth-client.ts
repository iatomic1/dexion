import {
	siwsClient,
	telegramClient,
	walletAddressVerificationClient,
} from "@dexion/auth/client";
import { DOMAIN_NAME } from "@dexion/shared";
import {
	emailOTPClient,
	inferAdditionalFields,
	oneTimeTokenClient,
	twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const URL =
	process.env.NODE_ENV === "production"
		? `https://${DOMAIN_NAME}`
		: "http://localhost:3001";
const NGROK_PERSONAL_DOMAIN =
	"https://unhuntable-kristofer-unresident.ngrok-free.dev";
export const authClient = createAuthClient({
	baseURL: URL,
	// baseURL: "https://ba366aec6386.ngrok-free.app",
	// baseURL: NGROK_PERSONAL_DOMAIN,
	// trustedOrigins: [NGROK_PERSONAL_DOMAIN],
	// baseURL:
	// 	typeof window !== "undefined"
	// 		? window.location.origin
	// 		: NGROK_PERSONAL_DOMAIN,
	fetchOptions: {
		credentials: "include",
	},
	plugins: [
		siwsClient(),
		walletAddressVerificationClient(),
		oneTimeTokenClient(),
		inferAdditionalFields({
			user: {
				inviteCode: {
					type: "string",
					required: false,
					input: true,
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
		}),
		twoFactorClient(),
		emailOTPClient(),
		telegramClient(),
	],
});
