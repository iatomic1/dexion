import { TOKEN_WATCHER_API_BASE_URL } from "@repo/shared-constants/constants.ts";
import type {
	ApiRes,
	FilterTokenSwapTransaction,
	TokenMetadata,
} from "@repo/tokens/types";
import type { TokenLockedLiquidity, TokenPoints } from "~/types/stxwatch";

type PulseResponse = {
	trending: TokenMetadata[];
	all: TokenMetadata[];
	completed: TokenMetadata[];
	limit: number;
	new: TokenMetadata[];
	page: number;
	total: number;
};

export const getBatchTokenData = async (contract_ids: string[]) => {
	try {
		const url = `${TOKEN_WATCHER_API_BASE_URL}tokens/get_batch_token_data`;
		const res = await fetch(url, {
			method: "POST",
			body: JSON.stringify({ contract_ids: contract_ids }),
		});

		if (!res.ok) throw new Error(`Failed: ${res.status}`);

		const data = (await res.json()) as TokenMetadata[];
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const getSearchResults = async (searchTerm: string) => {
	try {
		const url = `${TOKEN_WATCHER_API_BASE_URL}tokens/search?searchTerm=${searchTerm}`;
		const res = await fetch(url);

		if (!res.ok) throw new Error(`Failed: ${res.status}`);

		const data = (await res.json()) as { tokens: TokenMetadata[] };
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const getPoints = async (ca: string) => {
	try {
		const url = `${TOKEN_WATCHER_API_BASE_URL}tokens/get_latest_token_points_single/${ca}`;
		const res = await fetch(`${url}`);

		if (!res.ok) throw new Error(`Failed: ${res.status}`);

		const data = (await res.json()) as TokenPoints;
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const getLockedLiquidity = async (ca: string) => {
	try {
		const url = `${TOKEN_WATCHER_API_BASE_URL}tokens/get_batch_locked_liquidity/${ca}`;
		const res = await fetch(url);

		if (!res.ok) throw new Error(`Failed: ${res.status}`);

		const data = (await res.json()) as TokenLockedLiquidity[];
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const getPulse = async () => {
	try {
		const url = `${TOKEN_WATCHER_API_BASE_URL}pulse`;
		const res = await fetch(url);

		if (!res.ok) throw new Error(`Failed: ${res.status}`);

		const data = (await res.json()) as PulseResponse;
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const getFilterTrades = async (address: string, poolId: string) => {
	try {
		const targetUrl = `${TOKEN_WATCHER_API_BASE_URL}tokens/pools/${poolId}/swaps?address=${address}`;

		const res = await fetch(targetUrl);

		if (!res.ok) throw new Error(`Failed: ${res.status}`);

		const data = (await res.json()) as ApiRes<FilterTokenSwapTransaction>;
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
