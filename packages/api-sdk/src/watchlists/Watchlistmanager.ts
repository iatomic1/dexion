import type { ApiResponse } from "@/types";
import makeFetch, { type BASE_URL } from "@/utils/fetch";
import { addWatchlistSchema, deleteWatchlistSchema } from "./schema";
import type {
	AddWatchlistInput,
	DeleteWatchlistInput,
	UserWatchlist,
} from "./types";

export class WatchlistManager {
	private authToken: string;
	private userId: string;
	private isNextjs: boolean;

	constructor(userId: string, authToken: string, isNextjs: boolean) {
		this.userId = userId;
		this.authToken = authToken;
		this.isNextjs = isNextjs;
	}

	async getUserWatchlist(): Promise<ApiResponse<UserWatchlist[]>> {
		return await makeFetch<ApiResponse<UserWatchlist[]>>(
			"dexion",
			"watchlist",
			this.authToken,
			{ method: "GET" },
		)();
	}

	async addToWatchlist(
		data: AddWatchlistInput,
	): Promise<ApiResponse<UserWatchlist>> {
		const parsed = addWatchlistSchema.parse(data);
		return await makeFetch<ApiResponse<UserWatchlist>>(
			"dexion",
			"watchlist",
			this.authToken,
			{
				method: "POST",
				body: {
					...parsed,
					userId: this.userId,
				},
			},
		)();
	}

	async deleteWatchlist(
		data: DeleteWatchlistInput,
	): Promise<ApiResponse<UserWatchlist>> {
		const parsed = deleteWatchlistSchema.parse(data);
		return await makeFetch<ApiResponse<UserWatchlist>>(
			"dexion",
			`watchlist/${parsed.id}`,
			this.authToken,
			{
				method: "DELETE",
			},
		)();
	}
}
