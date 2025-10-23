import {
	DexionError,
	type ApiResponse,
	type FetchOptions,
} from "../types/index";

import type {
	AddWalletInput,
	RemoveWalletInput,
	UpdateWalletInput,
	UserWallet,
} from "./types";
import type { DexionClient } from "../DexionApiSDK";

export class WalletManager {
	constructor(private client: DexionClient) {}

	async addWallet(
		data: AddWalletInput,
		options?: FetchOptions,
	): Promise<ApiResponse<UserWallet>> {
		const auth = this.client.getAuth();
		if (!auth.userId) {
			throw new DexionError(
				"User ID required. Call setAuth() first.",
				"USER_ID_REQUIRED",
			);
		}

		return this.client.fetch<ApiResponse<UserWallet>>("dexion", "wallets", {
			method: "POST",
			body: {
				userId: auth.userId,
				...data,
			},
			fetchOptions: options,
		});
	}

	async updateWalletPreferences(
		data: UpdateWalletInput,
		options?: FetchOptions,
	): Promise<ApiResponse<UserWallet>> {
		const { walletAddress, ...rest } = data;
		return this.client.fetch<ApiResponse<UserWallet>>(
			"dexion",
			`wallets/${walletAddress}`,
			{
				method: "PATCH",
				body: rest,
				fetchOptions: options,
			},
		);
	}

	async removeWallet(
		data: RemoveWalletInput,
		options?: FetchOptions,
	): Promise<ApiResponse<void>> {
		return this.client.fetch<ApiResponse<void>>(
			"dexion",
			`wallets/${data.walletAddress}`,
			{
				method: "DELETE",
				fetchOptions: options,
			},
		);
	}

	async getWallets(options?: FetchOptions): Promise<ApiResponse<UserWallet[]>> {
		return this.client.fetch<ApiResponse<UserWallet[]>>("dexion", "wallets", {
			method: "GET",
			fetchOptions: options,
		});
	}
}
