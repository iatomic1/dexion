import type { TokenHolder, TokenMetadata } from "../types";

export function transformStxCityToTokenMetadata(input: any): TokenMetadata {
	return {
		bc: "stxcity",
		contract_id: input.token_contract,
		dex_contract: input.dex_contract,
		progress: input.progress,
		symbol: input.symbol,
		decimals: input.decimals,
		name: input.name,
		circulating_supply: input.supply.toString(), // Assuming circulating = total here
		total_supply: input?.supply?.toString(),
		image_url: input.logo_url,
		header_image_url: null, // fallback to same if there's no separate header image
		description: input.description,
		verified: true, // Assuming active = verified
		socials: [
			...(input.xlink ? [{ platform: "twitter", value: input.xlink }] : []),
			...(input.homepage
				? [{ platform: "website", value: input.homepage }]
				: []),
		],
		source: "stxcity",
		metrics: {
			contract_id: input.dex_contract,
			holder_count: input.holders,
			swap_count: input.txs_count,
			transfer_count: null, // No data provided
			price_usd: 0,
			price_change_1d: 0,
			price_change_7d: 0,
			price_change_30d: 0,
			liquidity_usd: 0,
			marketcap_usd: 0,
			volume_1h_usd: 0,
			volume_6h_usd: 0,
			volume_1d_usd: input.trading_volume,
			volume_7d_usd: 0, // Placeholder
		},
	};
}

type RawFakFunToken = {
	id: string;
	name: string;
	symbol: string;
	description: string;
	preContract?: string;
	tokenContract: string;
	dexContract?: string | null;
	progress?: number;
	decimals: number;
	supply: number;
	logoUrl?: string;
	mediaUrl?: string;
	price?: number;
	price24hChanges?: number | null;
	tradingVolume?: number;
	holders?: number;
	tokenVerified?: number;
	twitter?: string;
	website?: string;
	telegram?: string;
	discord?: string;
};
export function transformFakFunToTokenMetadata(
	raw: any,
	source: "fakfun" | "stxtools",
): TokenMetadata {
	const socials = [
		{ platform: "twitter", value: raw.twitter },
		{ platform: "website", value: raw.website },
		{ platform: "telegram", value: raw.telegram },
		{ platform: "discord", value: raw.discord },
	]
		.filter((s) => s.value && s.value.trim() !== "")
		.map((s) => ({ platform: s.platform, value: s.value! }));

	return {
		contract_id: raw.tokenContract,
		symbol: raw.symbol,
		decimals: raw.decimals,
		name: raw.name,
		circulating_supply: raw.supply.toString(),
		total_supply: raw.supply.toString(),
		image_url: raw.logoUrl || "",
		header_image_url: raw.mediaUrl || null,
		description: raw.description,
		verified: raw.tokenVerified === 1,
		bc: "fakfun",
		socials,
		metrics: {
			contract_id: raw.tokenContract,
			holder_count: raw.holders || 0,
			swap_count: raw.tradingVolume || 0,
			transfer_count: null,
			price_usd: raw.price || 0,
			price_change_1d: raw.price24hChanges || 0,
			price_change_7d: 0,
			price_change_30d: 0,
			liquidity_usd: 0,
			marketcap_usd: raw.marketCap
				? raw.marketCap
				: (raw.price || 0) * (raw.supply || 0),
			volume_1h_usd: 0,
			volume_6h_usd: 0,
			volume_1d_usd: raw.tradingVolume || 0,
			volume_7d_usd: 0,
		},
		bc_data: {
			pre_contract: raw.preContract || null,
			targetAmm: raw.targetAmm || null,
			tokenToDex: raw.tokenToDex || null,
			tokenToDeployer: raw.tokenToDeployer || null,
		},
		dex_contract: raw.dexContract || null,
		progress: raw.progress || 0,
		source,
	};
}

// Raw shape returned by Tenero (stxtools' rebrand) for a single token, see TENERO.md
export function transformTeneroToTokenMetadata(raw: any): TokenMetadata {
	return {
		contract_id: raw.address,
		dex_contract: null,
		symbol: raw.symbol,
		decimals: raw.decimals,
		name: raw.name,
		circulating_supply: String(raw.circulating_supply ?? 0),
		total_supply: String(raw.total_supply ?? 0),
		image_url: raw.image_url || "",
		header_image_url: null,
		description: raw.description || "",
		verified: true,
		socials: [],
		metrics: {
			contract_id: raw.address,
			holder_count: raw.holder_count || 0,
			// Tenero has no lifetime swap count, only rolling windows - 7d is the closest analog
			swap_count: raw.metrics?.swaps_7d || 0,
			transfer_count: null,
			price_usd: raw.price_usd || 0,
			price_change_1d: raw.price?.price_change_1d_pct || 0,
			price_change_7d: raw.price?.price_change_7d_pct || 0,
			price_change_30d: raw.price?.price_change_30d_pct || 0,
			liquidity_usd: raw.total_liquidity_usd || 0,
			marketcap_usd: raw.marketcap_usd || 0,
			volume_1h_usd: raw.metrics?.volume_1h_usd || 0,
			// Tenero has no 6h window - 4h is the closest analog
			volume_6h_usd: raw.metrics?.volume_4h_usd || 0,
			volume_1d_usd: raw.metrics?.volume_1d_usd || 0,
			volume_7d_usd: raw.metrics?.volume_7d_usd || 0,
		},
		source: "stxtools",
	};
}

// Raw shape returned by Tenero for a row in a token's holder list, see TENERO.md
export function transformTeneroHolder(raw: any, index: number): TokenHolder {
	return {
		balance: String(raw.balance ?? 0),
		debits: String(raw.debits ?? 0),
		credits: String(raw.credits ?? 0),
		total_spent_usd: String(raw.trade_stats?.buy_amount_usd ?? 0),
		total_received_usd: String(raw.trade_stats?.sell_amount_usd ?? 0),
		total_buys: String(raw.trade_stats?.buy_tx_count ?? 0),
		total_sells: String(raw.trade_stats?.sell_tx_count ?? 0),
		total_pnl_usd: String(raw.trade_stats?.realized_pnl_usd ?? 0),
		wallet: {
			address: raw.wallet_address,
			bns: raw.wallet_name || null,
			tags: [],
		},
		// Tenero doesn't return a rank - rows come back sorted by balance desc
		rank: index + 1,
	};
}

// function normalizePrice(price: number): string {
//   if (!Number.isFinite(price)) return "0";
//   return price.toLocaleString("fullwide", {
//     useGrouping: false,
//     maximumSignificantDigits: 21,
//   });
// }
