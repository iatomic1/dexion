import type { DexionClient } from "../DexionApiSDK";
import type { ApiResponse, FetchOptions } from "../types/index";
import { encryptToken } from "../utils/crypto";
import type { WebhookConfig } from "./types";

export class WebhookManager {
	constructor(private client: DexionClient) {}

	async getWebhook(
		options?: FetchOptions,
	): Promise<ApiResponse<WebhookConfig>> {
		return this.client.fetch<ApiResponse<WebhookConfig>>("dexion", "webhooks", {
			method: "GET",
			fetchOptions: options,
		});
	}
	async createWebhook(
		data: WebhookConfig,
		options?: FetchOptions,
	): Promise<ApiResponse<WebhookConfig>> {
		const { bearerToken, webhookUrl } = data;
		const encryptedToken = bearerToken
			? encryptToken(bearerToken, process.env.INTERNAL_SECRET!)
			: undefined;

		return this.client.fetch<ApiResponse<WebhookConfig>>("dexion", "webhooks", {
			method: "POST",
			body: {
				bearerToken: encryptedToken,
				webhookUrl,
			},
			fetchOptions: options,
		});
	}

	async updateWebhook(
		data: Partial<WebhookConfig>,
		options?: FetchOptions,
	): Promise<ApiResponse<WebhookConfig>> {
		const { bearerToken, webhookUrl } = data;
		const encryptedToken = bearerToken
			? encryptToken(bearerToken, process.env.INTERNAL_SECRET!)
			: undefined;

		return this.client.fetch<ApiResponse<WebhookConfig>>("dexion", "webhooks", {
			method: "PUT",
			body: {
				bearerToken: encryptedToken,
				webhookUrl,
			},
			fetchOptions: options,
		});
	}
	async deleteWebhook(options?: FetchOptions): Promise<ApiResponse<void>> {
		return this.client.fetch<ApiResponse<void>>("dexion", "webhooks", {
			method: "DELETE",
			fetchOptions: options,
		});
	}
}
