import { STX_CITY_API_BASE_URL, STX_TOOLS_API_BASE_URL } from "@dexion/shared";
import { fetchFakFunTokens } from "@dexion/tokens/services";
import axios, { AxiosError } from "axios";
import type Redis from "ioredis";
import { logger } from "../lib/logger";

async function fetchStxToolsTokens() {
	try {
		const url = `${STX_TOOLS_API_BASE_URL}tokens?page=0&size=4000`;
		const response = await axios.get(url);
		return response.data.data.map((t: any) => t.contract_id);
	} catch (err) {
		if (err instanceof AxiosError) {
			logger.error({ error: err.message }, "stxtools fetch failed");
			throw err;
		}
		throw err;
	}
}

async function fetchStxCityTokens() {
	try {
		const url = `${STX_CITY_API_BASE_URL}fetchFrontEnd/bondingData?page=1&limit=1000`;
		const response = await axios.get(url);
		return response.data.all;
	} catch (err) {
		if (err instanceof AxiosError) {
			logger.error(
				{ error: err.message, status: err.response?.status },
				"stxcity fetch failed",
			);
			throw err;
		}
		throw err;
	}
}

async function safeFetchFakFun() {
	try {
		return await fetchFakFunTokens();
	} catch (err) {
		logger.error({ error: (err as Error).message }, "fakfun fetch failed");
		throw err;
	}
}

export async function updateTokenSources(redisClient: Redis) {
	let stxToolsTokens: any[] = [];
	let stxCityTokens: any[] = [];
	let fakfunTokens: any[] = [];

	try {
		[stxToolsTokens, stxCityTokens, fakfunTokens] = await Promise.all([
			fetchStxToolsTokens(),
			fetchStxCityTokens(),
			safeFetchFakFun(),
		]);
	} catch (err) {
		logger.error(
			{ error: (err as Error).message },
			"updateTokenSources upstream fetch failure",
		);
		return;
	}

	const pipeline = redisClient.pipeline();

	try {
		for (const token of stxToolsTokens) {
			pipeline.set(`source:${token}`, "stxtools");
		}

		for (const token of stxCityTokens) {
			const key = `source:${token.token_contract}`;
			const value = token.progress < 100 ? "stxcity" : "stxtools";
			pipeline.set(key, value);
		}

		for (const token of fakfunTokens) {
			const value = token.progress < 1 ? "fakfun" : "stxtools";
			const contractId =
				token.progress < 1 ? token.dexContract : token.tokenContract;
			pipeline.set(`source:${contractId}`, value);
		}

		const results = await pipeline.exec();

		if (!results) {
			logger.error("redis pipeline returned null");
			return;
		}

		results.forEach(([err], idx) => {
			if (err) {
				logger.error(
					{ index: idx, error: err.message },
					"redis pipeline command failed",
				);
			}
		});

		logger.info("token source update complete");
	} catch (err) {
		logger.error(
			{ error: (err as Error).message },
			"redis updateTokenSources failure",
		);
	}
}
