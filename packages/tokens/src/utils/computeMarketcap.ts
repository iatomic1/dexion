export function computeFakFunMarketcap(
	tokenToDex: number,
	decimals: number,
	price: number,
	stxUsd: number,
): number {
	const tokenAmount = tokenToDex / Math.pow(10, decimals);
	return tokenAmount * price * stxUsd;
}
