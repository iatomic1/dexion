import { STX_TOOLS_API_BASE_URL, STXWATCH_API_BASE_URL } from "@dexion/shared";
import {
	fetchFakFunTokens,
	getFakFunTokenMetadata,
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
import { logger } from "../../lib/logger";
import redisClient from "../../services/redis";

const tokens = new Hono();

tokens.get("/source/:contractId", async (c) => {
	try {
		const contractId = c.req.param("contractId");
		const source = await redisClient.get("source:" + contractId);
		if (source) {
			return c.json({ source });
		}
		return c.json({ error: "Source not found" }, 404);
	} catch (err) {
		logger.error(
			err,
			"[source] Error fetching source for " + c.req.param("contractId"),
		);
	}
});

tokens.get("pools/:poolId/swaps", async (c) => {
	const poolId = c.req.param("poolId");
	const address = c.req.query("address");

	if (!address) return c.json({ error: "Address is required" }, 400);

	const url =
		STX_TOOLS_API_BASE_URL +
		"pools/" +
		poolId +
		"/swaps?page=0&size=50&sort=burn_block_time%2Cdesc&type=all&address=" +
		address;

	const res = await fetch(url);
	const data = await res.json();

	return c.json(data);
});

tokens.get("/get_latest_token_points_single/:ca", async (c) => {
	const ca = c.req.param("ca");
	const url = STXWATCH_API_BASE_URL + "get_latest_token_points_single";

	const { data } = await axios.post(
		url,
		{
			p_contract_id: ca,
		},
		{
			headers: {
				Authorization: "Bearer " + STX_WATCH_API_KEY,
				Apikey: STX_WATCH_API_KEY,
			},
		},
	);
	return c.json(data, 200);
});

tokens.get("/get_batch_locked_liquidity/:ca", async (c) => {
	const ca = c.req.param("ca");
	const url = STXWATCH_API_BASE_URL + "get_batch_locked_liquidity";

	const { data } = await axios.post(
		url,
		{
			contract_ids: [ca],
		},
		{
			headers: {
				Authorization: "Bearer " + STX_WATCH_API_KEY,
				Apikey: STX_WATCH_API_KEY,
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
		logger.error(err, "[search] Validation error for term: " + searchTerm);
		isContract = false;
	}

	try {
		const [stxtoolsTokens, stxcityRaw, fakfunAll] = await Promise.all([
			getSearch(searchTerm),
			searchStxCity(searchTerm, isContract),
			fetchFakFunTokens(),
		]);

		const fakfunFiltered = fakfunAll.filter((token) => {
			const term = searchTerm.toLowerCase();
			return (
				token.name.toLowerCase().includes(term) ||
				token.symbol.toLowerCase().includes(term) ||
				token.tokenContract.toLowerCase().includes(term)
			);
		});

		const fakfunTokens = fakfunFiltered.map((raw) => {
			const source = raw.progress < 1 ? "fakfun" : "stxtools";
			return transformFakFunToTokenMetadata(raw, source);
		});

		const stxcityTokens = (stxcityRaw || []).map(
			transformStxCityToTokenMetadata,
		);

		const combined = [
			...(stxtoolsTokens || []),
			...stxcityTokens,
			...fakfunTokens,
		];

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
		logger.error(
			error,
			"[search] Internal Server Error during search execution",
		);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

tokens.post("/get_batch_token_data", async (c) => {
	const startTime = Date.now();
	logger.info("[get_batch_token_data] Request started");

	try {
		const body = await c.req.json();
		const contract_ids = body.contract_ids;

		logger.info(
			{ count: contract_ids?.length ?? 0 },
			"[get_batch_token_data] Received contract IDs",
		);

		if (!Array.isArray(contract_ids)) {
			logger.error(
				"[get_batch_token_data] Invalid input: contract_ids is not an array",
			);
			return c.json({ error: "contract_ids must be an array" }, 400);
		}

		if (contract_ids.length === 0) {
			logger.warn("[get_batch_token_data] Empty contract_ids array");
			return c.json([]);
		}

		logger.debug(
			{ contract_ids },
			"[get_batch_token_data] Processing Contract IDs",
		);

		const redisStartTime = Date.now();
		const redisKeys = contract_ids.map((id) => "source:" + id);
		const sources = await redisClient.mget(redisKeys);
		const redisEndTime = Date.now();

		logger.info(
			{ durationMs: redisEndTime - redisStartTime },
			"[get_batch_token_data] Redis MGET completed",
		);

		const sourceMap = {};
		contract_ids.forEach((id, idx) => {
			sourceMap[id] = sources[idx] ?? null;
		});

		const sourceDistribution = contract_ids.reduce((acc, id) => {
			const src = sourceMap[id] ?? "missing";
			acc[src] = (acc[src] || 0) + 1;
			return acc;
		}, {});

		logger.info(
			{ sourceDistribution },
			"[get_batch_token_data] Source distribution calculated",
		);

		const fetchStartTime = Date.now();
		const tokenDataPromises = contract_ids.map(async (contractId) => {
			const tokenStartTime = Date.now();
			try {
				const src = sourceMap[contractId];

				if (!src) {
					logger.warn({ contractId }, "[get_batch_token_data] No source found");
					return { contractId, error: "No source" };
				}

				logger.debug(
					{ contractId, src },
					"[get_batch_token_data] Fetching token data",
				);

				if (src === "stxcity") {
					const raw = await getStxCityTokenMetadata(contractId, true);
					if (!raw) {
						logger.warn(
							{ contractId },
							"[get_batch_token_data] No stxcity metadata found",
						);
						return { contractId, error: "No stxcity metadata found" };
					}
					const result = transformStxCityToTokenMetadata(raw);
					if (!result) {
						logger.warn(
							{ contractId },
							"[get_batch_token_data] Transform failed",
						);
						return {
							contractId,
							error: "Failed to transform stxcity metadata",
						};
					}
					logger.info(
						{ contractId, durationMs: Date.now() - tokenStartTime },
						"[get_batch_token_data] Fetched from stxcity",
					);
					return result;
				}

				if (src === "stxtools") {
					const result = await getTokenMetadata(contractId);
					if (!result) {
						logger.warn(
							{ contractId },
							"[get_batch_token_data] No stxtools metadata found",
						);
						return { contractId, error: "No stxtools metadata found" };
					}
					logger.info(
						{ contractId, durationMs: Date.now() - tokenStartTime },
						"[get_batch_token_data] Fetched from stxtools",
					);
					return result;
				}

				if (src === "fakfun") {
					const result = await getFakFunTokenMetadata(contractId);
					if (!result) {
						logger.warn(
							{ contractId },
							"[get_batch_token_data] No fakfun metadata found",
						);
						return { contractId, error: "No fakfun metadata found" };
					}
					logger.info(
						{ contractId, durationMs: Date.now() - tokenStartTime },
						"[get_batch_token_data] Fetched from fakfun",
					);
					return result;
				}

				const errorMsg =
					src === "fak"
						? "Fake token metadata disabled"
						: "Unknown token source";
				logger.warn(
					{ contractId, src, errorMsg },
					"[get_batch_token_data] Metadata fetch skipped or unknown source",
				);
				return { contractId, error: errorMsg };
			} catch (error) {
				const errorMsg = error?.message ?? "Unknown error";
				logger.error(
					{
						err: error,
						contractId,
						durationMs: Date.now() - tokenStartTime,
					},
					"[get_batch_token_data] Failed to get metadata",
				);
				return { contractId, error: errorMsg };
			}
		});

		const results = await Promise.all(tokenDataPromises);
		const fetchEndTime = Date.now();

		const successCount = results.filter((r) => r && !r.error).length;
		const errorCount = results.filter((r) => !r || r.error).length;

		logger.info(
			{
				durationMs: fetchEndTime - fetchStartTime,
				successCount,
				errorCount,
				totalDurationMs: Date.now() - startTime,
			},
			"[get_batch_token_data] Batch fetch completed",
		);

		return c.json(results);
	} catch (error) {
		logger.error(error, "[get_batch_token_data] Fatal error");
		return c.json({ error: "Internal server error" }, 500);
	}
});

export default tokens;
