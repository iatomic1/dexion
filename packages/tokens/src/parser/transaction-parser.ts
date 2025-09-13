import type {
	MempoolTransaction,
	Transaction,
} from "@stacks/blockchain-api-client";
import { PROTOCOL_CONFIG } from "./config";
import { StackingDAOHandler } from "./handlers/stacking-dao-handler";
import { STXTransferHandler } from "./handlers/stx-transfer-handler";
import { SwapHandler } from "./handlers/swap-handler";
import { ZestHandler } from "./handlers/zest-handler";
import type { ParsedTransaction, ProtocolHandler } from "./types";

export class TransactionParser {
	private handlers: ProtocolHandler[] = [];

	constructor() {
		this.initializeHandlers();
	}

	private initializeHandlers() {
		// Initialize protocol handlers
		this.handlers = [
			new StackingDAOHandler(),
			new ZestHandler(),
			new SwapHandler("Velar", ["path-apply"], ["apply"]),
			new SwapHandler("ALEX", ["multihop"], ["swap"]),
			new SwapHandler(
				"Bitflow",
				["stableswap", "xyk-swap-helper-v-1-3"],
				["swap", "swap-helper-a", "swap-helper-b"],
			),
		];
	}

	addHandler(handler: ProtocolHandler) {
		this.handlers.push(handler);
	}

	removeHandler(protocolName: string) {
		this.handlers = this.handlers.filter(
			(h) => h.getProtocolName() !== protocolName,
		);
	}

	parse(tx: Transaction): ParsedTransaction | null {
		try {
			// Handle STX transfers first
			const stxTransfer = STXTransferHandler.parse(tx);
			if (stxTransfer) return stxTransfer;

			// Handle contract calls
			if (tx.tx_type === "contract_call" && tx.contract_call) {
				const { contract_id, function_name } = tx.contract_call;

				// Find appropriate handler
				const handler = this.handlers.find((h) =>
					h.canHandle(contract_id, function_name),
				);
				if (handler) {
					const result = handler.parse(tx);
					if (result) return result;
				}

				// Fallback for unknown protocols
				const protocol =
					PROTOCOL_CONFIG.contracts[
						contract_id as keyof typeof PROTOCOL_CONFIG.contracts
					] || "Unknown Protocol";
				return {
					status: tx.tx_status,
					txId: tx.tx_id,
					sender: tx.sender_address,
					protocol,
					action: "Contract Call",
					contract: {
						id: contract_id,
						function: function_name,
					},
					details: {},
					summary: `${tx.sender_address} called ${contract_id}`,
				};
			}

			return null;
		} catch (error) {
			console.error(`Error parsing transaction ${tx.tx_id}:`, error);
			return null;
		}
	}

	parseMany(transactions: Transaction[]): ParsedTransaction[] {
		return transactions
			.map((tx) => this.parse(tx))
			.filter((result): result is ParsedTransaction => result !== null);
	}
}
