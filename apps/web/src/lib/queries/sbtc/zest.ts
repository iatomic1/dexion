import makeFetch from "~/lib/helpers/fetch";
import {
	ZestAssetPriceResponse,
	ZestReserveResponse,
	ZestUserAssetsResponse,
	ZestUserBalancesResponse,
} from "~/types/sbtc/zest";

const ZEST_BASE_PATH = "sbtc/zest";

export const getZestReserve = async () => {
	try {
		return makeFetch<ZestReserveResponse>(
			"hub",
			`${ZEST_BASE_PATH}/asset/reserve`,
			null,
			{ method: "GET" },
		)();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const getZestUserAssets = async (address: string) => {
	try {
		return makeFetch<ZestUserAssetsResponse>(
			"hub",
			`${ZEST_BASE_PATH}/${address}/assets`,
			null,
			{ method: "GET" },
		)();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const getZestUserBalances = async (address: string) => {
	try {
		return makeFetch<ZestUserBalancesResponse>(
			"hub",
			`${ZEST_BASE_PATH}/${address}/balances`,
			null,
			{ method: "GET" },
		)();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const getZestAssetPrices = async () => {
	try {
		return makeFetch<ZestAssetPriceResponse>(
			"hub",
			`${ZEST_BASE_PATH}/asset/price`,
			null,
			{ method: "GET" },
		)();
	} catch (error) {
		console.error(error);
		throw error;
	}
};
