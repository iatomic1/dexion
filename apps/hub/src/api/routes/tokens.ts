import { STX_TOOLS_API_BASE_URL, STXWATCH_API_BASE_URL } from "@dexion/shared";
import {
	fetchFakFunTokens,
	getSearch,
	getStxCityTokenMetadata,
	getTokenMetadata,
	searchStxCity,
} from "@dexion/tokens/services";
import {
	transformFakFunToTokenMetadata,
	transformStxCityToTokenMetadata,
	validateContractAddress,
} from "@dexion/tokens/utils";
import axios from "axios";
import { Hono } from "hono";
import { STX_WATCH_API_KEY } from "../../config/env";
import redisClient from "../../services/redis";

const tokens = new Hono();

tokens.get("/source/:contractId", async (c) => {
	try {
		const contractId = c.req.param("contractId");
		const source = await redisClient.get(`source:${contractId}`);
		if (source) {
			return c.json({ source });
		}
		return c.json({ error: "Source not found" }, 404);
	} catch (err) {
		console.error(err);
	}
});

tokens.get("pools/:poolId/swaps", async (c) => {
	const poolId = c.req.param("poolId");
	const address = c.req.query("address");

	// Optional: validate inputs
	if (!address) return c.json({ error: "Address is required" }, 400);

	const url = `${STX_TOOLS_API_BASE_URL}pools/${poolId}/swaps?page=0&size=50&sort=burn_block_time%2Cdesc&type=all&address=${address}`;

	const res = await fetch(url);
	const data = await res.json();

	return c.json(data);
});

tokens.get("/get_latest_token_points_single/:ca", async (c) => {
	const ca = c.req.param("ca");
	const url = `${STXWATCH_API_BASE_URL}get_latest_token_points_single`;

	const { data } = await axios.post(
		url,
		{
			p_contract_id: ca,
		},
		{
			headers: {
				Authorization: `Bearer ${STX_WATCH_API_KEY}`,
				Apikey: STX_WATCH_API_KEY as string,
			},
		},
	);
	return c.json(data, 200);
});

tokens.get("/get_batch_locked_liquidity/:ca", async (c) => {
	const ca = c.req.param("ca");
	const url = `${STXWATCH_API_BASE_URL}get_batch_locked_liquidity`;

	const { data } = await axios.post(
		url,
		{
			contract_ids: [ca],
		},
		{
			headers: {
				Authorization: `Bearer ${STX_WATCH_API_KEY}`,
				Apikey: STX_WATCH_API_KEY as string,
			},
		},
	);
	return c.json(data, 200);
});

tokens.get("/search", async (c) => {
	const searchTerm = c.req.query("searchTerm");
	if (!searchTerm) return c.json({ error: "Missing searchTerm" }, 400);

	let isContract;
	try {
		isContract = validateContractAddress(searchTerm);
	} catch (err) {
		console.error(err);
		isContract = false;
	}

	try {
		const [stxtoolsTokens, stxcityRaw, fakfunAll] = await Promise.all([
			getSearch(searchTerm),
			searchStxCity(searchTerm, isContract),
			fetchFakFunTokens(),
		]);

		// filter fakfun manually
		const fakfunFiltered = fakfunAll.filter((token: any) => {
			const term = searchTerm.toLowerCase();
			return (
				token.name.toLowerCase().includes(term) ||
				token.symbol.toLowerCase().includes(term) ||
				token.tokenContract.toLowerCase().includes(term)
			);
		});

		// transform fakfun tokens
		const fakfunTokens = fakfunFiltered.map((raw: any) => {
			const source = raw.progress < 1 ? "fakfun" : "stxtools";
			return transformFakFunToTokenMetadata(raw, source);
		});

		// transform stxcity tokens
		const stxcityTokens = (stxcityRaw || []).map(
			transformStxCityToTokenMetadata,
		);

		// combine all
		const combined = [
			...(stxtoolsTokens || []),
			...stxcityTokens,
			...fakfunTokens,
		];

		// dedupe by priority: stxtools > stxcity > fakfun
		const tokenMap = new Map();
		const priority = { stxtools: 3, stxcity: 2, fakfun: 1 };

		for (const token of combined) {
			const id = token.contract_id;
			const existing = tokenMap.get(id);

			if (!existing) {
				tokenMap.set(id, token);
				continue;
			}

			if (
				priority[token.platform || token.source] >
				priority[existing.platform || existing.source]
			) {
				tokenMap.set(id, token);
			}
		}

		const filtered = Array.from(tokenMap.values());

		return c.json({ tokens: filtered });
	} catch (error) {
		console.error(error);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

tokens.post("/get_batch_token_data", async (c) => {
	try {
		const body = await c.req.json();
		const contract_ids = body.contract_ids;

		if (!Array.isArray(contract_ids)) {
			return c.json({ error: "contract_ids must be an array" }, 400);
		}

		// ------------- Batch fetch sources from Redis -------------
		// Using MGET to avoid N calls

		// ------------- Batch fetch sources from Redis -------------
		const redisKeys = contract_ids.map((id) => `source:${id}`);
		const sources = await redisClient.mget(redisKeys);

		const sourceMap: Record<string, string | null> = {};

		contract_ids.forEach((id, idx) => {
			sourceMap[id] = sources[idx] ?? null;
		});

		// ------------- Fetch token data based on source -------------
		const tokenDataPromises = contract_ids.map(async (contractId) => {
			try {
				const src = sourceMap[contractId];

				if (src === "stxcity") {
					const raw = await getStxCityTokenMetadata(contractId, true);

					if (!raw) {
						return { contractId, error: "No stxcity metadata found" };
					}

					return transformStxCityToTokenMetadata(raw);
				}

				if (src === "stxtools") {
					return await getTokenMetadata(contractId);
				}

				// If source undefined OR marked "fak"
				return {
					contractId,
					error:
						src === "fak"
							? "Fake token — metadata disabled"
							: "Unknown token source",
				};
			} catch (error) {
				console.error(`Failed to get metadata for ${contractId}:`, error);
				return { contractId, error: error?.message ?? "Unknown error" };
			}
		});

		const results = await Promise.all(tokenDataPromises);
		return c.json(results);
	} catch (error) {
		console.error("Error in get_batch_token_data:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

export default tokens;
