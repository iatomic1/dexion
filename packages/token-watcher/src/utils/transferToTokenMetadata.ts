import type { TokenMetadata } from "../types/token";

export function transformToTokenMetadata(input: any): TokenMetadata {
  return {
    contract_id: input.token_contract,
    dex_contract: input.dex_contract,
    progress: input.progress,
    symbol: input.symbol,
    decimals: input.decimals,
    name: input.name,
    circulating_supply: input.supply.toString(), // Assuming circulating = total here
    total_supply: input?.supply?.toString(),
    image_url: input.logo_url,
    header_image_url: input.logo_url, // fallback to same if there's no separate header image
    description: input.description,
    verified: true, // Assuming active = verified
    socials: [
      ...(input.xlink ? [{ platform: "twitter", value: input.xlink }] : []),
      ...(input.homepage
        ? [{ platform: "website", value: input.homepage }]
        : []),
    ],
    metrics: {
      contract_id: input.dex_contract,
      holder_count: input.holders,
      swap_count: input.txs_count,
      transfer_count: null, // No data provided
      price_usd: 0, // Placeholder
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
