import { swapQueue } from "@/queues";
import { extractAssetContracts } from "@/utils";
import { Hono, type Context } from "hono";

const swaps = new Hono();

const bigLogs = false;

function log(...args: any[]) {
	if (bigLogs) console.log(...args);
}

export async function handleSwapWebhook(c: Context) {
	try {
		log("step1: got req");
		const body = await c.req.json();
		log("step2: parsed body");
		log("body", JSON.stringify(body, null, 2));

		log("step3: tx meta");
		const txMetadata = body.event.apply[0].transactions[0].metadata;
		log("txMetadata", JSON.stringify(txMetadata, null, 2));

		log("step4: post conds");
		const postConditions = txMetadata.post_conditions.post_conditions;
		log("postConditions", JSON.stringify(postConditions, null, 2));

		log("step5: assets");
		const assetContracts = extractAssetContracts(postConditions);
		log("assetContracts", assetContracts);

		const senderAddress = txMetadata.sender_address;
		log("step6: enqueue maybe");

		if (txMetadata.status === "success")
			await swapQueue.add("swap-event", { senderAddress, assetContracts });

		return c.json({ message: "ok" }, 200);
	} catch (err) {
		console.error("velar webhook err:", err);
		return c.json({ error: "fail" }, 500);
	}
}

swaps.post("/velar", async (c) => {
	try {
		log("step1: got req");
		const body = await c.req.json();
		log("step2: parsed body");
		log("body", JSON.stringify(body, null, 2));

		log("step3: tx meta");
		const txMetadata = body.event.apply[0].transactions[0].metadata;
		log("txMetadata", JSON.stringify(txMetadata, null, 2));

		log("step4: post conds");
		const postConditions = txMetadata.post_conditions.post_conditions;
		log("postConditions", JSON.stringify(postConditions, null, 2));

		log("step5: assets");
		const assetContracts = extractAssetContracts(postConditions);
		log("assetContracts", assetContracts);

		const senderAddress = txMetadata.sender_address;
		log("step6: enqueue maybe");

		if (txMetadata.status === "success")
			await swapQueue.add("swap-event", { senderAddress, assetContracts });

		return c.json({ message: "ok" }, 200);
	} catch (err) {
		console.error("velar webhook err:", err);
		return c.json({ error: "fail" }, 500);
	}
});

swaps.post("/bitflow", async (c) => {
	handleSwapWebhook(c);
});

export default swaps;
