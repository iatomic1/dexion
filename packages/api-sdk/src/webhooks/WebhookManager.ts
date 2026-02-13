import type { DexionClient } from "../DexionApiSDK";
import type { ApiResponse, FetchOptions } from "../types/index";
import { decryptToken, encryptToken } from "../utils/crypto";
import type { WebhookConfig } from "./types";

export class WebhookManager {
	constructor(private client: DexionClient) {}

	async getWebhook(
		options?: FetchOptions,
	): Promise<ApiResponse<WebhookConfig>> {
		const response = await this.client.fetch<ApiResponse<WebhookConfig>>(
			"dexion",
			"webhooks",
			{
				method: "GET",
				fetchOptions: options,
			},
		);

		// If response not OK or no data, return as is
		if (!response || response.status !== "OK" || !response.data) {
			return response;
		}

		const { bearerToken } = response.data;

		// decrypt ONLY if it exists
		if (bearerToken) {
			try {
				const decrypted = decryptToken(
					bearerToken,
					process.env.INTERNAL_SECRET!,
				);

				return {
					...response,
					data: {
						...response.data,
						bearerToken: decrypted,
					},
				};
			} catch (err) {
				// Optional: prevent leaking crypto errors
				return {
					...response,
					errors: ["Failed to decrypt bearer token"],
				};
			}
		}

		return response;
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
