import { STX_CITY_API_BASE_URL, STX_TOOLS_API_BASE_URL } from "@dexion/shared";
import { fetchFakFunTokens } from "@dexion/tokens/services";
import axios, { AxiosError } from "axios";
import type Redis from "ioredis";
import { logger } from "../lib/logger";

async function fetchStxToolsTokens() {
	try {
		const baseUrl = `${STX_TOOLS_API_BASE_URL}tokens`;
		let cursor: string | undefined;
		const addresses: string[] = [];

		do {
			const url = cursor ? `${baseUrl}?cursor=${cursor}` : baseUrl;

			const response = await axios.get(url);
			const { rows, next } = response.data.data;

			addresses.push(...rows.map((t: any) => t.address));

			cursor = next;
		} while (cursor);

		console.log(`Fetched ${addresses.length} tokens`);
		return addresses;
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
	const [stxToolsResult, stxCityResult, fakfunResult] =
		await Promise.allSettled([
			fetchStxToolsTokens(),
			fetchStxCityTokens(),
			safeFetchFakFun(),
		]);

	// Each source is independent - a failure fetching one (e.g. Tenero's bulk
	// listing endpoint, which isn't confirmed working post-rebrand) shouldn't
	// stop the other two sources from getting their entries refreshed.
	const stxToolsTokens: any[] =
		stxToolsResult.status === "fulfilled" ? stxToolsResult.value : [];
	const stxCityTokens: any[] =
		stxCityResult.status === "fulfilled" ? stxCityResult.value : [];
	const fakfunTokens: any[] =
		fakfunResult.status === "fulfilled" ? fakfunResult.value : [];

	if (stxToolsResult.status === "rejected") {
		logger.error({ stxToolsResult });
		logger.error(
			{ error: stxToolsResult.reason?.message },
			"updateTokenSources: stxtools fetch failed, skipping its entries",
		);
	}
	if (stxCityResult.status === "rejected") {
		logger.error(
			{ error: stxCityResult.reason?.message },
			"updateTokenSources: stxcity fetch failed, skipping its entries",
		);
	}
	if (fakfunResult.status === "rejected") {
		logger.error(
			{ error: fakfunResult.reason?.message },
			"updateTokenSources: fakfun fetch failed, skipping its entries",
		);
	}

	if (!stxToolsTokens.length && !stxCityTokens.length && !fakfunTokens.length) {
		logger.error("updateTokenSources: all upstream fetches failed");
		return;
	}

	const pipeline = redisClient.pipeline();

	try {
		for (const token of stxToolsTokens) {
			pipeline.set(`source:${token}`, "stxtools");
		}

		for (const token of stxCityTokens) {
			const contractId = token.token_contract;
			const value = token.progress < 100 ? "stxcity" : "stxtools";
			pipeline.set(`source:${contractId}`, value);
			// bc is observed directly from stxcity's own bonding-curve listing,
			// never inferred - written once and kept even after graduation.
			pipeline.setnx(`bc:${contractId}`, "stxcity");
		}

		for (const token of fakfunTokens) {
			const value = token.progress < 1 ? "fakfun" : "stxtools";
			const contractId =
				token.progress < 1 ? token.dexContract : token.tokenContract;
			pipeline.set(`source:${contractId}`, value);
			pipeline.setnx(`bc:${contractId}`, "fakfun");
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
