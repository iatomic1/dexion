import { type Context, Hono } from "hono";
import { logger } from "@/config/logger";
import { swapQueue } from "@/queues";
import { extractAssetContracts } from "@/utils";

const swaps = new Hono();

export async function handleSwapWebhook(c: Context) {
	try {
		logger.debug("step1: got req");
		const body = await c.req.json();
		logger.debug({ body }, "step2: parsed body");

		const txMetadata = body.event.apply[0].transactions[0].metadata;
		logger.debug({ txMetadata }, "step3: tx meta");

		const postConditions = txMetadata.post_conditions.post_conditions;
		logger.debug({ postConditions }, "step4: post conds");

		const assetContracts = extractAssetContracts(postConditions);
		logger.debug({ assetContracts }, "step5: assets");

		const senderAddress = txMetadata.sender_address;
		logger.debug("step6: enqueue maybe");

		if (txMetadata.status === "success")
			await swapQueue.add("swap-event", { senderAddress, assetContracts });

		return c.json({ message: "ok" }, 200);
	} catch (err) {
		logger.error(err, "velar webhook err:");
		return c.json({ error: "fail" }, 500);
	}
}

swaps.post("/velar", handleSwapWebhook);

swaps.post("/bitflow", handleSwapWebhook);

export default swaps;
