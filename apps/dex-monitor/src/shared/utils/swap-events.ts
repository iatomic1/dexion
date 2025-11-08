import type { TokenMetadata } from "@dexion/tokens/types";
import type { Alert } from "@/core/alerts/alert";

export function getMetricValue(metric: string, token: TokenMetadata): number {
	const metricMap: Record<string, number> = {
		price: token.metrics.price_usd,
		liquidity: token.metrics.liquidity_usd,
		marketcap: token.metrics.marketcap_usd,
		holders: token.metrics.holder_count,
	};

	return metricMap[metric] ?? 0;
}
