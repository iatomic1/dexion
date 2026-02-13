import type { TokenMetadata } from "../types";

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
		...(input.source ?? {}),
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

// function normalizePrice(price: number): string {
//   if (!Number.isFinite(price)) return "0";
//   return price.toLocaleString("fullwide", {
//     useGrouping: false,
//     maximumSignificantDigits: 21,
//   });
// }
