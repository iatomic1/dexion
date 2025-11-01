import type { DexionClient } from "../DexionApiSDK";
import type { ApiResponse, FetchOptions } from "../types/index";
import type { WebhookConfig } from "./types";

export class WebhookManager {
	constructor(private client: DexionClient) {}

	async createWebhook(
		data: WebhookConfig,
		options?: FetchOptions,
	): Promise<ApiResponse<WebhookConfig>> {
		const { bearerToken, webhookUrl } = data;
		return this.client.fetch<ApiResponse<WebhookConfig>>("dexion", "webhooks", {
			method: "POST",
			body: {
				bearerToken: bearerToken,
				webhookUrl: webhookUrl,
			},
			fetchOptions: options,
		});
	}

	async getWebhook(
		options?: FetchOptions,
	): Promise<ApiResponse<WebhookConfig>> {
		return this.client.fetch<ApiResponse<WebhookConfig>>("dexion", "webhooks", {
			method: "GET",
			fetchOptions: options,
		});
	}

	async updateWebhook(
		data: Partial<WebhookConfig>,
		options?: FetchOptions,
	): Promise<ApiResponse<WebhookConfig>> {
		const { bearerToken, webhookUrl } = data;
		return this.client.fetch<ApiResponse<WebhookConfig>>("dexion", "webhooks", {
			method: "PUT",
			body: {
				bearerToken: bearerToken,
				webhookUrl: webhookUrl,
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
