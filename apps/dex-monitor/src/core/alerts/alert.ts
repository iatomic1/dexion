import type { TokenMetadata } from "@dexion/tokens/types";

export type Alert = {
	channels: string[];
	ca: string;
	createdAt: string;
	updatedAt: string;
	value: number;
	id: string;
	userId: string;
	status: "active" | "paused" | "completed";
	repeatable: boolean;
	operator: string;
	metric: string;
};

export function shouldTrigger(alert: Alert, token: TokenMetadata): boolean {
	const metricMap: Record<string, number> = {
		price: token.metrics.price_usd,
		liquidity: token.metrics.liquidity_usd,
		marketcap: token.metrics.marketcap_usd,

		holders: token.metrics.holder_count,
	};
	const currentValue = metricMap[alert.metric] ?? 0;
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
