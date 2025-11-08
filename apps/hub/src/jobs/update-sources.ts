import { STX_CITY_API_BASE_URL, STX_TOOLS_API_BASE_URL } from "@dexion/shared";
import { fetchFakFunTokens } from "@dexion/tokens/services";
import axios from "axios";
import type Redis from "ioredis";

async function fetchStxToolsTokens() {
	const response = await axios.get(
		`${STX_TOOLS_API_BASE_URL}tokens?page=0&size=4000`,
	);
	return response.data.data.map((token: any) => token.contract_id);
}

async function fetchStxCityTokens() {
	const response = await axios.get(
		`${STX_CITY_API_BASE_URL}fetchFrontEnd/bondingData?page=1&limit=1000`,
	);
	return response.data.all;
}

export async function updateTokenSources(redisClient: Redis) {
	const [stxToolsTokens, stxCityTokens, fakfunTokens] = await Promise.all([
		fetchStxToolsTokens(),
		fetchStxCityTokens(),
		fetchFakFunTokens(),
	]);
	// const stxToolsSet = new Set(stxToolsTokens.map((t: string) => t));
	const pipeline = redisClient.pipeline();

	for (const token of stxToolsTokens) {
		pipeline.set(`source:${token}`, "stxtools");
	}

	for (const token of stxCityTokens) {
		const key = `source:${token.token_contract}`;
		const value = token.progress < 100 ? "stxcity" : "stxtools";
		pipeline.set(key, value);
	}

	for (const token of fakfunTokens) {
		const key = `source:${token.dexContract}`;
		const value = token.progress < 1 ? "fakfun" : "stxtools";
		pipeline.set(key, value);
	}

	const results = await pipeline.exec();

	if (!results) {
		console.error("Redis pipeline returned null");
		return;
	}

	results.forEach(([err, result], index) => {
		if (err) {
			console.error(`Redis pipeline error at index ${index}:`, err);
		}
	});

	console.log("done");
}
