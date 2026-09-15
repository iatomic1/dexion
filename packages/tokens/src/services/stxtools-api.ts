import axios from "axios";
import { STX_TOOLS_API_BASE_URL, HIRO_API_BASE_URL } from "@dexion/shared";
import type {
	TokenMetadata,
	ApiRes,
	TokenSwapTransaction,
	TokenHolder,
	LiquidityPool,
} from "../types";
import {
	transformTeneroToTokenMetadata,
	transformTeneroHolder,
} from "../utils/transferToTokenMetadata";

export const getTokenMetadata = async (
	ca: string,
): Promise<TokenMetadata | null> => {
	try {
		const url = `${STX_TOOLS_API_BASE_URL}tokens/${ca}`;
		const { data } = await axios.get(url);

		return data?.data ? transformTeneroToTokenMetadata(data.data) : null;
	} catch (err) {
		// console.error(err);
		return null;
	}
};

export const getTrades = async (
	ca: string,
): Promise<ApiRes<TokenSwapTransaction> | null> => {
	try {
		const url = `${STX_TOOLS_API_BASE_URL}tokens/${ca}/swaps?page=0&size=50&type=all`;
		const { data } = await axios.get(url);

		return data;
	} catch (err) {
		// console.error(err);
		return null;
	}
};

export const getHolders = async (
	ca: string,
): Promise<ApiRes<TokenHolder> | null> => {
	try {
		const url = `${STX_TOOLS_API_BASE_URL}tokens/${ca}/holders`;
		const { data } = await axios.get(url);
		const rows = data?.data?.rows;
		if (!Array.isArray(rows)) return null;

		return {
			data: rows.map(transformTeneroHolder),
			rowCount: rows.length,
		};
	} catch (err) {
		// console.error(err);
		return null;
	}
};
export const getPools = async (ca: string): Promise<LiquidityPool[] | null> => {
	try {
		const url = `${STX_TOOLS_API_BASE_URL}tokens/${ca}/pools`;
		const { data } = await axios.get(url);

		return data;
	} catch (err) {
		// console.error(err);
		return null;
	}
};

export const getSearch = async (
	searchTerm: string,
): Promise<TokenMetadata[] | null> => {
	try {
		const url = `${STX_TOOLS_API_BASE_URL}search?q=${searchTerm}`;
		const { data } = await axios.get(url);
		const tokens = data?.data?.tokens;
		if (!Array.isArray(tokens)) return null;

		return tokens.map((token: any) => transformTeneroToTokenMetadata(token));
	} catch (err) {
		// console.error(err);
		return null;
	}
};

export const getDevTokens = async (
	address: string,
): Promise<TokenMetadata[] | null> => {
	try {
		const url = `${HIRO_API_BASE_URL}metadata/v1/ft?address=${address}`;
		const { data } = await axios.get(url);

		// Check if results exist
		if (!data?.results || !Array.isArray(data.results)) {
			return null;
		}

		// Map through results and call getTokenMetadata for each contract_principal
		const tokenMetadataPromises = data.results.map(async (token: any) => {
			if (token.contract_principal) {
				return await getTokenMetadata(token.contract_principal);
			}
			return null;
		});

		// Wait for all promises to resolve
		const tokenMetadataResults = await Promise.all(tokenMetadataPromises);

		// Filter out null results and return
		const validTokenMetadata = tokenMetadataResults.filter(
			(metadata) => metadata !== null,
		);

		return validTokenMetadata.length > 0 ? validTokenMetadata : null;
	} catch (err) {
		// console.error(err);
		return null;
	}
};
