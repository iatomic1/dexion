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
