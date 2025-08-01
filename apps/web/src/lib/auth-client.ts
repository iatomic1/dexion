import { DOMAIN_NAME } from "@repo/shared-constants/constants.ts";
import {
	emailOTPClient,
	inferAdditionalFields,
	oneTimeTokenClient,
	twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { siwsClient } from "./auth/plugins/siws/client";

export const authClient = createAuthClient({
	baseURL:
		process.env.NODE_ENV === "production"
			? `https://${DOMAIN_NAME}`
			: "http://localhost:3001",
	// baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3001",
	plugins: [
		siwsClient(),
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
	],
});
