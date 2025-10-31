"use server";
import { createServerSDK } from "@dexion/api-sdk/DexionApiSDK.ts";
import { webhookConfigSchema } from "@dexion/api-sdk/index.ts";
import { authenticatedAction } from "~/lib/safe-action";
import { revalidateTagServer } from "./revalidate";

export const createWebhookConfigAction = authenticatedAction
	.inputSchema(webhookConfigSchema)
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		try {
			const sdk = createServerSDK(user.accessToken, user.userId);
			const webhookConfig = await sdk.webhooks.createWebhook(input);

			revalidateTagServer(`user-webhook-config-${user.userId}`);

			return webhookConfig;
		} catch (err) {
			console.error(JSON.stringify(err, null, 2));
			if (err instanceof Error) throw err;
			throw new Error("An unknown error occurred");
		}
	});

export const updateWebhookConfigAction = authenticatedAction
	.inputSchema(webhookConfigSchema)
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		try {
			const sdk = createServerSDK(user.accessToken, user.userId);
			const webhookConfig = await sdk.webhooks.updateWebhook(input);

			revalidateTagServer(`user-webhook-config-${user.userId}`);

			return webhookConfig;
		} catch (err) {
			console.error(JSON.stringify(err, null, 2));
			if (err instanceof Error) throw err;
			throw new Error("An unknown error occurred");
		}
	});

export const getWebhookConfigAction = authenticatedAction.action(
	async ({ ctx: { user } }) => {
		try {
			const sdk = createServerSDK(user.accessToken, user.userId);
			const webhookConfig = await sdk.webhooks.getWebhook({
				next: {
					tags: [`user-webhook-config-${user.userId}`],
				},
			});

			return webhookConfig;
		} catch (err) {
			console.error(JSON.stringify(err, null, 2));
			if (err instanceof Error) throw err;
			throw new Error("An unknown error occurred");
		}
	},
);

export const deleteWebhookConfigAction = authenticatedAction.action(
	async ({ ctx: { user } }) => {
		try {
			const sdk = createServerSDK(user.accessToken, user.userId);
			const res = await sdk.webhooks.deleteWebhook();

			revalidateTagServer(`user-webhook-config-${user.userId}`);

			return res;
		} catch (err) {
			console.error(JSON.stringify(err, null, 2));
			if (err instanceof Error) throw err;
			throw new Error("An unknown error occurred");
		}
	},
);
