import type { Transaction } from "@stacks/blockchain-api-client";
import { PROTOCOL_CONFIG } from "../config";
import type { ParsedTransaction } from "../types";
import { TransactionUtils } from "../utils";

export class STXTransferHandler {
	static parse(tx: Transaction): ParsedTransaction | null {
		if (tx.tx_type !== "token_transfer") return null;
		const amount = (Number(tx.token_transfer.amount) / 1_000_000).toString();

		try {
			return {
				status: tx.tx_status,
				txId: tx.tx_id,
				protocol: "Stacks",
				action: "STX Transfer",
				sender: tx.sender_address,
				details: {
					sent: {
						asset: "STX",
						amount,
						contractId: PROTOCOL_CONFIG.tokens.STX.contractId,
					},
					recipient: tx.token_transfer.recipient_address,
				},
				summary: `${tx.sender_address} sent ${amount} STX to ${tx.token_transfer.recipient_address}`,
			};
		} catch (error) {
			console.error("Error parsing STX transfer:", error);
			return null;
		}
	}
}
