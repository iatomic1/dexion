import type { DexionClient } from "../DexionApiSDK";
import {
	type ApiResponse,
	DexionError,
	type FetchOptions,
} from "../types/index";
import type {
	AddWatchlistInput,
	DeleteWatchlistInput,
	UserWatchlist,
} from "./types";

export class WatchlistManager {
	constructor(private client: DexionClient) {}

	async getUserWatchlist(
		options?: FetchOptions,
	): Promise<ApiResponse<UserWatchlist[]>> {
		return this.client.fetch<ApiResponse<UserWatchlist[]>>(
			"dexion",
			"watchlist",
			{
				method: "GET",
				fetchOptions: options,
			},
		);
	}

	async addToWatchlist(
		data: AddWatchlistInput,
		options?: FetchOptions,
	): Promise<ApiResponse<UserWatchlist>> {
		const auth = this.client.getAuth();
		if (!auth.userId) {
			throw new DexionError(
				"User ID required. Call setAuth() first.",
				"USER_ID_REQUIRED",
			);
		}

		return this.client.fetch<ApiResponse<UserWatchlist>>(
			"dexion",
			"watchlist",
			{
				method: "POST",
				body: {
					...data,
					userId: auth.userId,
				},
				fetchOptions: options,
			},
		);
	}

	async deleteWatchlist(
		data: DeleteWatchlistInput,
		options?: FetchOptions,
	): Promise<ApiResponse<UserWatchlist>> {
		return this.client.fetch<ApiResponse<UserWatchlist>>(
			"dexion",
			`watchlist/${data.id}`,
			{
				method: "DELETE",
				fetchOptions: options,
			},
		);
	}
}
