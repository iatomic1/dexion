import { STX_TOOLS_API_BASE_URL, STXWATCH_API_BASE_URL } from "@dexion/shared";
import { getProvider, type ProviderSource } from "@dexion/tokens/providers";
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

	try {
		const [stxtoolsTokens, stxcityTokens, fakfunTokens] = await Promise.all([
			getProvider("stxtools").search(searchTerm),
			getProvider("stxcity").search(searchTerm),
			getProvider("fakfun").search(searchTerm),
		]);

		const combined = [
			...(stxtoolsTokens || []),
			...(stxcityTokens || []),
			...(fakfunTokens || []),
		];

		const tokenMap = new Map();
		const priority: Record<ProviderSource, number> = {
			stxtools: 3,
			stxcity: 2,
			fakfun: 1,
		};

		for (const token of combined) {
			const id = token.contract_id;
			const existing = tokenMap.get(id);

			if (!existing) {
				tokenMap.set(id, token);
				continue;
			}

			if (priority[token.source] > priority[existing.source]) {
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

				if (src !== "stxcity" && src !== "stxtools" && src !== "fakfun") {
					logger.warn(
						{ contractId, src },
						"[get_batch_token_data] Unknown token source",
					);
					return { contractId, error: "Unknown token source" };
				}

				const result = await getProvider(src).getTokenMetadata(contractId);
				if (!result) {
					logger.warn(
						{ contractId, src },
						"[get_batch_token_data] No metadata found",
					);
					return { contractId, error: `No ${src} metadata found` };
				}

				logger.info(
					{ contractId, src, durationMs: Date.now() - tokenStartTime },
					"[get_batch_token_data] Fetched token metadata",
				);
				return result;
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
