// import { reverifyClient } from "@better-auth-kit/reverify/client";
import {
	emailOTPClient,
	inferAdditionalFields,
	twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: "http://localhost:3001",
	plugins: [
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
		// reverifyClient(),
		emailOTPClient(),
	],
});
