import { fetchFakFunTokens } from "@dexion/tokens/services";
import {
	CHAINHOOKS_BASE_URL,
	ChainhooksClient,
} from "@hirosystems/chainhooks-client";
import { logger } from "@/config/logger";

// Client config
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

// Webhook URLs
const WEBHOOK_BASE_URL =
	"https://unhuntable-kristofer-unresident.ngrok-free.dev/webhooks/swaps/";
const PROD_WEBHOOK_BASE_URL = "https://dexmonitor.dexion.pro/webhooks/swaps/";

// ---------- FAKFUN ----------
async function registerFakFunChainhooks(
	baseUrl: string,
	tokens: any[],
	fnName: "buy" | "sell",
) {
	try {
		const events = tokens.map((t) => ({
			type: "contract_call",
			contract_identifier: t.dexContract,
			function_name: fnName,
		}));

		await client.registerChainhook({
			version: "1",
			name: `fakfun-swap-update-${fnName}`,
			chain: "stacks",
			network: "mainnet",
			filters: { events },
			action: { type: "http_post", url: `${baseUrl}fakfun/${fnName}` },
			options: CHAINHOOK_OPTIONS,
		});

		logger.info(`Registered FakFun ${fnName} chainhooks`);
	} catch (err) {
		logger.error(err, `Failed to register FakFun ${fnName} chainhooks`);
	}
}

async function registerAllFakFunChainhooks(baseUrl: string) {
	const fakfunTokens = await fetchFakFunTokens();
	await Promise.all([
		registerFakFunChainhooks(baseUrl, fakfunTokens, "buy"),
		registerFakFunChainhooks(baseUrl, fakfunTokens, "sell"),
	]);
}

// ---------- SWAPS ----------
async function registerSwapChainhooks(baseUrl: string) {
	try {
		// Velar
		const velarEvents = [
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
		];

		const velarChainhook = await client.registerChainhook({
			version: "1",
			name: "velar-swap-update",
			chain: "stacks",
			network: "mainnet",
			filters: { events: velarEvents },
			action: { type: "http_post", url: `${baseUrl}velar` },
			options: CHAINHOOK_OPTIONS,
		});

		// Bitflow
		const bitflowFunctions = [
			"swap-helper-a",
			"swap-helper-b",
			"swap-helper-c",
		];
		const bitflowEvents = bitflowFunctions.map((fn) => ({
			type: "contract_call",
			contract_identifier:
				"SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.router-stableswap-xyk-multihop-v-1-1",
			function_name: fn,
		}));

		const bitflowChainhook = await client.registerChainhook({
			version: "1",
			name: "bitflow-swap-update",
			chain: "stacks",
			network: "mainnet",
			filters: { events: bitflowEvents },
			action: { type: "http_post", url: `${baseUrl}bitflow` },
			options: CHAINHOOK_OPTIONS,
		});

		logger.info(
			{ velarChainhook, bitflowChainhook },
			"Swap chainhooks registered",
		);
	} catch (err) {
		logger.error(err, "Failed to register swap chainhooks");
	}
}

// ---------- UPDATE ----------
async function updateChainhookWebhookURLs(baseUrl: string) {
	try {
		const chainhooks = await client.getChainhooks();

		for (const c of chainhooks.results) {
			const urlSuffix = c.definition.name.includes("velar")
				? "velar"
				: c.definition.name.includes("bitflow")
					? "bitflow"
					: "";
			if (!urlSuffix) continue;

			await client.updateChainhook(c.uuid, {
				action: { type: "http_post", url: `${baseUrl}${urlSuffix}` },
			});

			await client.enableChainhook(c.uuid, true);
		}

		logger.info("Chainhooks updated and enabled");
	} catch (err) {
		logger.error(err, "Failed to update chainhook URLs");
	}
}

// ---------- GET ----------
async function getChainhookByUUID(uuid: string) {
	try {
		const chainhook = await client.getChainhook(uuid);

		logger.info(chainhook, "Chainhook retrieved");
		return chainhook;
	} catch (err) {
		logger.error(err, "Failed to update chainhook URLs");
	}
}

// ---------- ENABLE ----------
async function enableAllChainhooks() {
	try {
		const chainhooks = await client.getChainhooks();

		for (const c of chainhooks.results) {
			await client.enableChainhook(c.uuid, true);
		}

		logger.info("Chainhooks enabled");
	} catch (err) {
		logger.error(err, "Failed to enable chainhooks");
	}
}

// ---------- DELETE ----------
async function deleteAllChainhooks() {
	try {
		const chainhooks = await client.getChainhooks();

		for (const c of chainhooks.results) {
			await client.deleteChainhook(c.uuid);
		}

		logger.info("Chainhooks deleted");
	} catch (err) {
		logger.error(err, "Failed to delete chainhooks");
	}
}

// ---------- MAIN ----------
async function initChainhooks() {
	await registerAllFakFunChainhooks(PROD_WEBHOOK_BASE_URL);
	await registerSwapChainhooks(PROD_WEBHOOK_BASE_URL);

	// if (process.env.REGISTER_CHAINHOOKS_ON_LOAD === "true") {
	// 	await registerSwapChainhooks(PROD_WEBHOOK_BASE_URL);
	// }

	// await updateChainhookWebhookURLs(WEBHOOK_BASE_URL);
}

await getChainhookByUUID("a4645018-7afe-4b3d-b67e-afcb08542068");
// await initChainhooks();
// const chainhooks = await client.getChainhooks({ limit: 1 });
// logger.info(chainhooks, "Chainhooks");
