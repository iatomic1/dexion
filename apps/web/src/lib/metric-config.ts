import type { TokenMetadata } from "@dexion/tokens/types";
import { formatPrice, formatTinyDecimal } from "./helpers/numbers";

export function buildMetricConfig(token: TokenMetadata | null) {
	console.log(token, "token");
	if (!token) {
		return {
			marketcap: {
				unit: "$",
				currentValue: 0,
				min: 0,
				max: 1000000,
				step: 1000,
				formatValue: (val: number) => `$${(val / 1_000_000).toFixed(1)}M`,
			},
			price: {
				unit: "$",
				currentValue: 0,
				min: 0,
				max: 1,
				step: 0.000001,
				formatValue: (val: number) => `$${val.toFixed(5)}`,
			},
			holders: {
				unit: "",
				currentValue: 0,
				min: 0,
				max: 100,
				step: 1,
				formatValue: (val: number) => val.toLocaleString("en-US"),
			},
			liquidity: {
				unit: "$",
				currentValue: 0,
				min: 0,
				max: 1000000,
				step: 1000,
				formatValue: (val: number) => `$${(val / 1_000_000).toFixed(2)}M`,
			},
		} as const;
	}

	const m = token.metrics;
	return {
		marketcap: {
			unit: "$",
			currentValue: m.marketcap_usd,
			min: 0,
			max: m.marketcap_usd * 2,
			step: Math.max(m.marketcap_usd / 20, 1),
			// formatValue: (val: number) => `$${(val / 1_000_000).toFixed(1)}M`,
			formatValue: (val: number) => {
				if (val > 1) {
					console.log("[formatValue] using formatPrice — val:", val);
					return formatPrice(token.metrics.price_usd);
				}
				console.log("[formatValue] using formatTinyDecimal — val:", val);
				return formatTinyDecimal(token.metrics.price_usd);
			},
		},
		price: {
			unit: "$",
			currentValue: m.price_usd,
			min: 0,
			max: m.price_usd * 2,
			step: Math.max(m.price_usd / 20, 0.000001),
			formatValue: (val: number) => `$${val.toFixed(5)}`,
		},
		holders: {
			unit: "",
			currentValue: m.holder_count,
			min: 0,
			max: Math.max(m.holder_count * 2, 100),
			step: Math.max(m.holder_count / 20, 1),
			formatValue: (val: number) => val.toLocaleString("en-US"),
		},
		liquidity: {
			unit: "$",
			currentValue: m.liquidity_usd,
			min: 0,
			max: m.liquidity_usd * 2,
			step: Math.max(m.liquidity_usd / 20, 1),
			formatValue: (val: number) => `$${(val / 1_000_000).toFixed(2)}M`,
		},
	} as const;
}

export type MetricConfig = ReturnType<typeof buildMetricConfig>;
export type MetricType = keyof MetricConfig;

export function getMetricConfig(metric: string, config: MetricConfig) {
	const defaultConfig = {
		currentValue: 0,
		min: 0,
		max: 1000000,
		step: 1000,
		unit: "",
		formatValue: (val: number) => val.toLocaleString(),
	};
	if (!config) {
		return defaultConfig;
	}
	return config[metric as MetricType] ?? config.price;
}

export function formatNumberWithCommas(value: string): string {
	const num = Number(value);
	return Number.isFinite(num)
		? num.toLocaleString("en-US", { maximumFractionDigits: 10 })
		: value;
}

export function calculatePresetValue(
	currentValue: number,
	percentage: number,
): number {
	return currentValue * (1 + percentage / 100);
}
