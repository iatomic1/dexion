export type ExtractedSwap = {
	senderAddress?: string;
	inToken?: string;
	inTokenAmount?: string;
	outToken?: string;
	outTokenAmount?: string;
};

export function extractSwapData(transactionData: any) {
	try {
		// Navigate to the transaction object
		const transaction = transactionData.apply[0].transactions[0];
		// console.log(transaction);

		// Get sender address
		const senderAddress = transaction.metadata.sender;

		// Get the swap event data (SmartContractEvent with swap details)
		const swapEvent = transaction.metadata.receipt.events.find(
			(event) =>
				event.type === "SmartContractEvent" && event.data.value?.op === "swap",
		);

		if (!swapEvent) {
			throw new Error("Swap event not found");
		}

		const swapData = swapEvent.data.value;

		// Extract token information
		const inToken = swapData["token-in"];
		const inTokenAmount = swapData["amt-in"];
		const outToken = swapData["token-out"];
		const outTokenAmount = swapData["amt-out"];

		return {
			senderAddress,
			inToken,
			inTokenAmount,
			outToken,
			outTokenAmount,
		};
	} catch (error) {
		console.error("Error extracting swap data:", error);
		return null;
	}
}
