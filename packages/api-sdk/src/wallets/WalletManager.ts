import type { ApiResponse } from "@/types";
import makeFetch from "@/utils/fetch";
import {
	addWalletSchema,
	removeWalletSchema,
	updateWalletSchema,
} from "./schema";
import type {
	AddWalletInput,
	RemoveWalletInput,
	UpdateWalletInput,
	UserWallet,
} from "./types";

export class WalletManager {
	private authToken: string;
	private userId: string;
	private isNextjs: boolean;

	constructor(userId: string, authToken: string, isNextjs: boolean) {
		this.userId = userId;
		this.authToken = authToken;
		this.isNextjs = isNextjs;
	}

	async addWallet(data: AddWalletInput): Promise<ApiResponse<UserWallet>> {
		const parsed = addWalletSchema.parse(data);
		return await makeFetch<ApiResponse<UserWallet>>(
			"dexion",
			"wallets",
			this.authToken,
			{
				method: "POST",
				body: {
					userId: this.userId,
					...parsed,
				},
				next: {},
			},
		)();
	}

	async updateWalletPreferences(
		data: UpdateWalletInput,
	): Promise<ApiResponse<UserWallet>> {
		const { walletAddress, ...rest } = updateWalletSchema.parse(data);
		return await makeFetch<ApiResponse<UserWallet>>(
			"dexion",
			`wallets/${walletAddress}`,
			this.authToken,
			{
				method: "PATCH",
				body: rest,
				next: {},
			},
		)();
	}

	async removeWallet(data: RemoveWalletInput): Promise<ApiResponse<unknown>> {
		const parsed = removeWalletSchema.parse(data);
		return await makeFetch<ApiResponse<unknown>>(
			"dexion",
			`wallets/${parsed.walletAddress}`,
			this.authToken,
			{
				method: "DELETE",
				next: {},
			},
		)();
	}

	async getWallets(): Promise<ApiResponse<UserWallet[]>> {
		return await makeFetch<ApiResponse<UserWallet[]>>(
			"dexion",
			"wallets",
			this.authToken,
			{
				method: "GET",
				next: {},
			},
		)();
	}
}
