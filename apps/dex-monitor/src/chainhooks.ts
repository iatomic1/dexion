import {
	CHAINHOOKS_BASE_URL,
	ChainhooksClient,
	type Chainhook,
	type PaginatedChainhookResponse,
} from "@hirosystems/chainhooks-client";

export const client = new ChainhooksClient({
	baseUrl: CHAINHOOKS_BASE_URL.mainnet,
	apiKey: process.env.HIRO_PLATFORM_API_KEY!,
});
const CHAINHOOK_OPTIONS = {
	decode_clarity_values: true,
	enable_on_registration: true,
	include_block_metadata: false,
	include_contract_abi: false,
	include_raw_transactions: false,
	include_post_conditions: true,
	include_block_signatures: false,
};
const WEBHOOK_BASE_URL =
	"https://unhuntable-kristofer-unresident.ngrok-free.dev/webhooks/swaps/";

const registerSwapChainhooks = async () => {
	try {
		const velarChainhook = await client.registerChainhook({
			version: "1",
			name: "velar-swap-update",
			chain: "stacks",
			network: "mainnet",
			filters: {
				events: [
					{
						type: "contract_call",
						contract_identifier:
							"SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY.path-apply_staging",
						function_name: "apply",
					},
					{
						type: "contract_call",
						contract_identifier:
							"SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY.path-apply_staging",
						function_name: "swap-univ2v2",
					},
				],
			},
			action: { type: "http_post", url: WEBHOOK_BASE_URL + "velar" },
			options: CHAINHOOK_OPTIONS,
		});

		const bitflowChainSwapUpdateFuncs = [
			"swap-helper-a",
			"swap-helper-c",
			"swap-helper-c",
		];

		const bitflowChainhook = await client.registerChainhook({
			version: "1",
			name: "bitflow-swap-update",
			chain: "stacks",
			network: "mainnet",
			filters: {
				events: bitflowChainSwapUpdateFuncs.map((fn) => ({
					type: "contract_call",
					contract_identifier:
						"SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.router-stableswap-xyk-multihop-v-1-1",
					function_name: fn,
				})),
			},
			action: { type: "http_post", url: WEBHOOK_BASE_URL + "bitflow" },
			options: CHAINHOOK_OPTIONS,
		});

		console.log("Chainhooks registered:", {
			velarChainhook,
			bitflowChainhook,
		});
	} catch (err) {
		console.error("Failed to register swap chainhooks:", err);
	}
};
// await registerSwapChainhooks();

const updateChainhookWebhookURL = async (
	chainhooks: PaginatedChainhookResponse,
) => {
	for (const c of chainhooks.results) {
		// await client.updateChainhook(c.uuid, {
		// 	action: {
		// 		type: "http_post",
		// 		url:
		// 			WEBHOOK_BASE_URL +
		// 			(c.definition.name.includes("velar") ? "velar" : "bitflow"),
		// 	},
		// });
		await client.enableChainhook(c.uuid, true);
	}
};
// await client.deleteChainhook("77cfa8d1-b9b0-4503-966d-3685de4e173c");
const chainhooks2 = await client.getChainhooks();

await updateChainhookWebhookURL(chainhooks2);
console.log(JSON.stringify(chainhooks2, null, 2));
