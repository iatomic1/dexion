"use server";
import { createServerSDK } from "@repo/api-sdk/DexionApiSDK.ts";
import { WebhookConfig, webhookConfigSchema } from "@repo/api-sdk/index.ts";
import { authenticatedAction } from "~/lib/safe-action";
import { revalidateTagServer } from "./revalidate";

export const createWebhookConfigAction = authenticatedAction
	.createServerAction()
	.input(webhookConfigSchema)
	.handler(async ({ input, ctx: { user } }) => {
		try {
			const sdk = createServerSDK(user.accessToken, user.userId);
			const webhookConfig = await sdk.webhooks.createWebhook(input);

			revalidateTagServer(`user-webhook-config-${user.userId}`);

			return webhookConfig;
		} catch (err) {
			console.error(JSON.stringify(err, null, 2));
		}
	});

export const updateWebhookConfigAction = authenticatedAction
	.createServerAction()
	.input(webhookConfigSchema)
	.handler(async ({ input, ctx: { user } }) => {
		try {
			const sdk = createServerSDK(user.accessToken, user.userId);
			const webhookConfig = await sdk.webhooks.updateWebhook(input);

			revalidateTagServer(`user-webhook-config-${user.userId}`);

			return webhookConfig;
		} catch (err) {
			console.error(JSON.stringify(err, null, 2));
		}
	});

export const getWebhookConfigAction = authenticatedAction
	.createServerAction()
	.handler(async ({ ctx: { user } }) => {
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
		}
	});

export const deleteWebhookConfigAction = authenticatedAction
	.createServerAction()
	.handler(async ({ ctx: { user } }) => {
		try {
			const sdk = createServerSDK(user.accessToken, user.userId);
			const res = await sdk.webhooks.deleteWebhook();

			revalidateTagServer(`user-webhook-config-${user.userId}`);

			return res;
		} catch (err) {
			console.error(JSON.stringify(err, null, 2));
		}
	});
