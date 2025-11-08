import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { config } from "@/config";
import { logger } from "@/config/logger";
import type { SwapEventPlatform } from "@/core/queues";
import { swapQueue } from "@/infrastructure/bullmq/queues";
import {
	extractAssetContracts,
	extractFakFunContracts,
} from "@/shared/utils/extractAssetContracts";

const swapIngestion = new Hono();

// Middleware for all swap ingestion routes
swapIngestion.use(
	"*",
	bearerAuth({
		verifyToken: async (token) => token === config.CHAINHOOK_CONSUMER_SECRET,
	}),
);

async function handleWebhook(c: any, platform: SwapEventPlatform) {
	try {
		const body = await c.req.json();
		const txMetadata = body.event.apply[0].transactions[0].metadata;

		if (txMetadata.status !== "success") {
			return c.json({ message: "Transaction not successful" }, 200);
		}

		const postConditions = txMetadata.post_conditions.post_conditions;
		let assetContracts: string[] = [];

		if (platform === "bitflow" || platform === "velar") {
			assetContracts = extractAssetContracts(postConditions);
		} else if (platform === "fakfun") {
			assetContracts = extractFakFunContracts(postConditions);
		}

		if (assetContracts.length > 0) {
			await swapQueue.add("process-swap", {
				senderAddress: txMetadata.sender_address,
				assetContracts,
				platform,
			});
		}

		return c.json({ message: "ok" }, 200);
	} catch (err) {
		logger.error(err, `Webhook handling failed for platform: ${platform}`);
		return c.json({ error: "failed to process webhook" }, 500);
	}
}

// Define routes for each platform
swapIngestion.post("/velar", (c) => handleWebhook(c, "velar"));
swapIngestion.post("/bitflow", (c) => handleWebhook(c, "bitflow"));
swapIngestion.post("/fakfun/buy", (c) => handleWebhook(c, "fakfun"));
swapIngestion.post("/fakfun/sell", (c) => handleWebhook(c, "fakfun"));

export default swapIngestion;
