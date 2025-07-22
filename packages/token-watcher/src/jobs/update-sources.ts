import {
	STX_CITY_API_BASE_URL,
	STX_TOOLS_API_BASE_URL,
} from "@repo/shared-constants/constants.ts";
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
	const stxToolsTokens = await fetchStxToolsTokens();
	const stxCityTokens = await fetchStxCityTokens();

	const pipeline = redisClient.pipeline();

	for (const token of stxToolsTokens) {
		pipeline.set(`source:${token}`, "stxtools");
	}

	for (const token of stxCityTokens) {
		const key = `source:${token.token_contract}`;
		const value = token.progress < 100 ? "stxcity" : "stxtools";
		pipeline.set(key, value);
	}

	await pipeline.exec();
	console.log("done");
}
