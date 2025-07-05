import type { MempoolTransaction } from "@stacks/blockchain-api-client";

export const extractTxDetails = (tx: MempoolTransaction) => {
	return {
		txId: tx.tx_id,
		senderAddress: tx.sender_address,
		status: tx.tx_status,
		type: tx.tx_type,
	};
};

export function formatPrice(price: number, decimals = 1): string {
	if (price === 0) return "0";
	if (!price || Number.isNaN(price)) return "N/A";

	const isNegative = price < 0;
	const absPrice = Math.abs(price);

	let formatted: string;

	if (absPrice < 1000) {
		formatted = absPrice.toFixed(decimals).replace(/\.0+$/, "");
	} else if (absPrice < 1_000_000) {
		formatted = `${(absPrice / 1000).toFixed(decimals).replace(/\.0+$/, "")}k`;
	} else if (absPrice < 1_000_000_000) {
		formatted = `${(absPrice / 1_000_000).toFixed(decimals).replace(/\.0+$/, "")}M`;
	} else if (absPrice < 1_000_000_000_000) {
		formatted = `${(absPrice / 1_000_000_000).toFixed(decimals).replace(/\.0+$/, "")}B`;
	} else {
		formatted =
			(absPrice / 1_000_000_000_000).toFixed(decimals).replace(/\.0+$/, "") +
			"T";
	}

	formatted = formatted.replace(/\.(\d*?)0+$/, ".$1").replace(/\.$/, "");

	return isNegative ? `-${formatted}` : formatted;
}
