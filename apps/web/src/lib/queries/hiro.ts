import type { AddressBalanceResponse } from "~/types/hiro/balance";
import type { PaginatedFtBasicMetadataResponse } from "~/types/hiro/token";
import type { Transaction } from "~/types/hiro/transactions";
import makeFetch from "../helpers/fetch";
import { client } from "../stacks-blockchain-api-client";

export const getBalance = async (address: string) => {
	try {
		return makeFetch<AddressBalanceResponse>(
			"hiro",
			`extended/v1/address/${address}/balances?unanchored=false`,
			null,
			{
				method: "GET",
			},
		)();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const searchTokens = async (searchTerm: string) => {
	try {
		return makeFetch<PaginatedFtBasicMetadataResponse>(
			"hiro",
			`metadata/v1/ft?symbol=${searchTerm}`,
			null,
			{
				method: "GET",
			},
		)();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export async function getTransactions(
	address: string,
	limit?: number,
	offset?: number,
) {
	const query: Record<string, number> = {};
	if (limit !== undefined) query.limit = limit;
	if (offset !== undefined) query.offset = offset;

	const { data } = await client.GET(
		"/extended/v2/addresses/{address}/transactions",
		{
			params: {
				path: { address },
				query,
			},
		},
	);

	return data;
}

// export const getTransactions = async (
// 	address: string,
// 	limit?: number,
// 	offset?: number,
// ) => {
// 	try {
// 		const params = new URLSearchParams();
// 		if (limit !== undefined) params.append("limit", String(limit));
// 		if (offset !== undefined) params.append("offset", String(offset));

// 		const query = params.toString();
// 		const url = `extended/v2/addresses/${address}/transactions${query ? `?${query}` : ""}`;

// 		return makeFetch<Transaction>("hiro", url, null, {
// 			method: "GET",
// 		})();
// 	} catch (error) {
// 		console.error(error);
// 		throw error;
// 	}
// };
