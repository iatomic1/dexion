import type { DexionClient } from "../DexionApiSDK";
import {
	type ApiResponse,
	DexionError,
	type FetchOptions,
} from "../types/index";
import type {
	AddAlertInput,
	Channel,
	RawUserAlert,
	RemoveAlertInput,
	UpdateAlertInput,
	UserAlert,
	UserAlertChannels,
} from "./types";

export class AlertManager {
	constructor(private client: DexionClient) {}

	async addAlert(
		data: AddAlertInput,
		options?: FetchOptions,
	): Promise<ApiResponse<UserAlert>> {
		const auth = this.client.getAuth();
		if (!auth.userId) {
			throw new DexionError(
				"User ID required. Call setAuth() first.",
				"USER_ID_REQUIRED",
			);
		}

		return this.client.fetch<ApiResponse<UserAlert>>("dexion", "alerts", {
			method: "POST",
			body: {
				userId: auth.userId,
				...data,
				value: data.value.toString(),
			},
			fetchOptions: options,
		});
	}

	async updateAlert(
		data: UpdateAlertInput,
		options?: FetchOptions,
	): Promise<ApiResponse<UserAlert>> {
		const { id, ...rest } = data;
		return this.client.fetch<ApiResponse<UserAlert>>("dexion", `alerts/${id}`, {
			method: "PATCH",
			body: {
				...rest,
				channelIds: rest.channels,
				value: rest.value.toString(),
			},
			fetchOptions: options,
		});
	}

	async removeAlert(
		data: RemoveAlertInput,
		options?: FetchOptions,
	): Promise<ApiResponse<void>> {
		return this.client.fetch<ApiResponse<void>>("dexion", `alerts/${data.id}`, {
			method: "DELETE",
			fetchOptions: options,
		});
	}

	async getAlertChannels(
		options?: FetchOptions,
	): Promise<ApiResponse<Channel[]>> {
		return this.client.fetch<ApiResponse<Channel[]>>(
			"dexion",
			"alerts/channels/all",
			{
				method: "GET",
				requiresAuth: false,
				fetchOptions: options,
			},
		);
	}

	async getUserAlertChannels(
		options?: FetchOptions,
	): Promise<ApiResponse<UserAlertChannels>> {
		return this.client.fetch<ApiResponse<UserAlertChannels>>(
			"dexion",
			"alerts/channels",
			{
				method: "GET",
				fetchOptions: options,
			},
		);
	}

	async getAlerts(options?: FetchOptions): Promise<ApiResponse<UserAlert[]>> {
		const response = await this.client.fetch<ApiResponse<RawUserAlert[]>>(
			"dexion",
			"alerts",
			{
				method: "GET",
				fetchOptions: options,
			},
		);

		if (response.status === "OK" && Array.isArray(response.data)) {
			const parsed = response.data.map((alert) => {
				let parsedChannels: Channel[] = [];
				try {
					const decoded = atob(alert.channels);
					parsedChannels = JSON.parse(decoded);
				} catch (error) {
					if (this.client["config"].debug) {
						console.error("[DexionSDK] Failed to parse channels:", error);
					}
					parsedChannels = [];
				}
				return {
					...alert,
					channels: parsedChannels,
				};
			});

			return { ...response, data: parsed };
		}

		return { ...response, data: [] };
	}
}
