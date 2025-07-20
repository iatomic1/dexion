import type { Transaction } from "@stacks/blockchain-api-client";
import type { ParsedTransaction } from "../types";
import { TransactionUtils } from "../utils";
import { BaseProtocolHandler } from "./base-handler";

export class SwapHandler extends BaseProtocolHandler {
	constructor(
		protocolName: string,
		contractPatterns: string[],
		private swapFunctions: string[],
	) {
		super(protocolName, contractPatterns);
	}

	canHandle(contractId: string, functionName?: string): boolean {
		return super.canHandle(contractId) && functionName
			? this.swapFunctions.some((fn) => functionName.includes(fn))
			: false;
	}

	parse(tx: Transaction): ParsedTransaction | null {
		try {
			const base = this.createBaseResponse(tx);
			const { post_conditions } = tx;

			const sent = TransactionUtils.findPostConditionBySender(
				post_conditions,
				tx.sender_address,
			);

			const receivedList = post_conditions.filter(
				(pc) => pc.principal.type_id === "principal_contract",
			);

			if (
				!sent ||
				receivedList.length === 0 ||
				(sent.type !== "stx" && sent.type !== "fungible")
			) {
				return null;
			}

			const received = receivedList[receivedList.length - 1];

			// Add explicit undefined check
			if (
				!received ||
				(received.type !== "stx" && received.type !== "fungible")
			) {
				return null;
			}

			const sentAsset = TransactionUtils.createAssetInfo(sent);
			if (!sentAsset) return null; // Handle null case for sent asset

			const receivedAsset = TransactionUtils.createAssetInfo(received);
			if (!receivedAsset) return null; // Handle null case for received asset

			return {
				...base,
				action: "Swap",
				details: {
					sent: sentAsset,
					received: receivedAsset,
				},
				summary: `${tx.sender_address} swapped ~${sentAsset.amount} ${sentAsset.asset} for ~${receivedAsset.amount} ${receivedAsset.asset} on ${this.protocolName}.`,
			};
		} catch (error) {
			console.error("Error parsing swap transaction:", error);
			return null;
		}
	}
}
