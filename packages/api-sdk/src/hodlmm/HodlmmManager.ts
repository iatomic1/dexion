import type { DexionClient } from "../DexionApiSDK";
import {
	type ApiResponse,
	DexionError,
	type FetchOptions,
} from "../types/index";
import type {
	CreateHodlmmAlertsInput,
	HodlmmAlert,
	UpdateHodlmmAlertInput,
} from "./types";

export class HodlmmManager {
	constructor(private client: DexionClient) {}

	/**
	 * Sync HODLMM alerts by fetching positions from the external API and creating missing alerts.
	 */
	async syncAlerts(
		options?: FetchOptions,
	): Promise<ApiResponse<HodlmmAlert[]>> {
		return this.client.fetch<ApiResponse<HodlmmAlert[]>>(
			"dexion",
			"hodlmm/alerts/sync",
			{
				method: "POST",
				fetchOptions: options,
			},
		);
	}

	/**
	 * Manually create multiple HODLMM alerts.
	 */
	async createAlerts(
		data: CreateHodlmmAlertsInput,
		options?: FetchOptions,
	): Promise<ApiResponse<HodlmmAlert[]>> {
		return this.client.fetch<ApiResponse<HodlmmAlert[]>>(
			"dexion",
			"hodlmm/alerts",
			{
				method: "POST",
				body: data,
				fetchOptions: options,
			},
		);
	}

	/**
	 * Get all HODLMM alerts for the authenticated user.
	 */
	async getAlerts(options?: FetchOptions): Promise<ApiResponse<HodlmmAlert[]>> {
		return this.client.fetch<ApiResponse<HodlmmAlert[]>>(
			"dexion",
			"hodlmm/alerts",
			{
				method: "GET",
				fetchOptions: options,
			},
		);
	}

	/**
	 * Get a specific HODLMM alert by ID.
	 */
	async getAlertById(
		id: string,
		options?: FetchOptions,
	): Promise<ApiResponse<HodlmmAlert>> {
		return this.client.fetch<ApiResponse<HodlmmAlert>>(
			"dexion",
			`hodlmm/alerts/${id}`,
			{
				method: "GET",
				fetchOptions: options,
			},
		);
	}

	/**
	 * Update an existing HODLMM alert.
	 */
	async updateAlert(
		data: UpdateHodlmmAlertInput,
		options?: FetchOptions,
	): Promise<ApiResponse<HodlmmAlert>> {
		const { id, ...rest } = data;
		return this.client.fetch<ApiResponse<HodlmmAlert>>(
			"dexion",
			`hodlmm/alerts/${id}`,
			{
				method: "PATCH",
				body: rest,
				fetchOptions: options,
			},
		);
	}

	/**
	 * Pause all HODLMM alerts for the user.
	 */
	async pauseAllAlerts(options?: FetchOptions): Promise<ApiResponse<void>> {
		return this.client.fetch<ApiResponse<void>>(
			"dexion",
			"hodlmm/alerts/pause",
			{
				method: "POST",
				fetchOptions: options,
			},
		);
	}

	/**
	 * Delete a specific HODLMM alert.
	 */
	async deleteAlert(
		id: string,
		options?: FetchOptions,
	): Promise<ApiResponse<void>> {
		return this.client.fetch<ApiResponse<void>>(
			"dexion",
			`hodlmm/alerts/${id}`,
			{
				method: "DELETE",
				fetchOptions: options,
			},
		);
	}
}
