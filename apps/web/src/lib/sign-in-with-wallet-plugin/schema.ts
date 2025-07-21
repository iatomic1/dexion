import type { AuthPluginSchema } from "better-auth";

export const schema = {
	walletAddress: {
		fields: {
			userId: {
				type: "string",
				references: {
					model: "user",
					field: "id",
				},
				required: true,
			},
			address: {
				type: "string",
				required: true,
			},
			network: { type: "string", required: true },
			isPrimary: {
				type: "boolean",
				defaultValue: false,
			},
			createdAt: {
				type: "date",
				required: true,
			},
		},
	},
} satisfies AuthPluginSchema;
