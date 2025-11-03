export const getMetricSign = (metric: string): string =>
	metric === "holders" ? "" : "$";

export function formatNumberByMetric(
	metric: string,
	value: number,
	locale = "en-US",
): string {
	const options: Intl.NumberFormatOptions = {};

	if (metric === "price") {
		options.minimumFractionDigits = 2;
		options.maximumFractionDigits = 6;
	} else {
		options.maximumFractionDigits = 0;
	}

	return value.toLocaleString(locale, options);
}
