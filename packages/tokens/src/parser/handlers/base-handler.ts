import type { Transaction } from "@stacks/blockchain-api-client";
import type { ParsedTransaction, ProtocolHandler } from "../types";

export abstract class BaseProtocolHandler implements ProtocolHandler {
	constructor(
		protected protocolName: string,
		protected contractPatterns: string[],
	) {}

	canHandle(contractId: string, functionName?: string): boolean {
		return this.contractPatterns.some((pattern) =>
			contractId.includes(pattern),
		);
	}

	getProtocolName(): string {
		return this.protocolName;
	}

	abstract parse(tx: Transaction): ParsedTransaction | null;

	protected createBaseResponse(tx: Transaction) {
		if (tx.tx_type !== "contract_call" || !tx.contract_call) {
			throw new Error("Invalid contract call transaction");
		}

		return {
			txId: tx.tx_id,
			sender: tx.sender_address,
			status: tx.tx_status,
			protocol: this.protocolName,
			contract: {
				id: tx.contract_call.contract_id,
				function: tx.contract_call.function_name,
			},
		};
	}
}
