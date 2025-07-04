import type { AddressBalanceResponse } from "~/types/hiro/balance";
import type { PaginatedFtBasicMetadataResponse } from "~/types/hiro/token";
import type { Transaction } from "~/types/hiro/transactions";
import makeFetch from "../helpers/fetch";

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

export const getTransactions = async (address: string) => {
	try {
		return makeFetch<Transaction>(
			"hiro",
			`extended/v2/addresses/${address}/transactions`,
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
