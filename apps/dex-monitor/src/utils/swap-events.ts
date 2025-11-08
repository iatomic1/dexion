import type { TokenMetadata } from "@dexion/tokens/types";
import { logger } from "@/config/logger";
import type { CachedUserProfile } from "@/lib/redis/user-profile";
import type { Alert } from "@/workers/swap-events-worker";

export function getMetricValue(metric: string, token: TokenMetadata): number {
	const metricMap: Record<string, number> = {
		price: token.metrics.price_usd,
		liquidity: token.metrics.liquidity_usd,
		marketcap: token.metrics.marketcap_usd,
		holders: token.metrics.holder_count,
	};

	return metricMap[metric] ?? 0;
}

export function evaluateAlert(alert: Alert, token: TokenMetadata): boolean {
	const currentValue = getMetricValue(alert.metric, token);
	const alertValue = Number(alert.value);

	switch (alert.operator) {
		case ">":
			return currentValue > alertValue;
		case "<":
			return currentValue < alertValue;
		case ">=":
			return currentValue >= alertValue;
		case "<=":
			return currentValue <= alertValue;
		case "=":
			return currentValue === alertValue;
		case "!=":
			return currentValue !== alertValue;
		default:
			return false;
	}
}
export function hasChannel(
	userProfile: CachedUserProfile | null,
	channel: string,
): boolean {
	logger.debug(userProfile?.telegram_id, "userprofile telegram");
	const channelMap: Record<string, boolean> = {
		email: !!userProfile?.email,
		telegram: !!userProfile?.telegram_id,
		webhook: !!userProfile?.webhook,
	};
	return channelMap[channel] ?? false;
}
