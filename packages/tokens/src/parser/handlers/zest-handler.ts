import type { Transaction } from "@stacks/blockchain-api-client";
import type { ParsedTransaction, PostCondition } from "../types";
import { TransactionUtils } from "../utils";
import { BaseProtocolHandler } from "./base-handler";

export class ZestHandler extends BaseProtocolHandler {
	constructor() {
		super("Zest", ["borrow-helper"]);
	}

	parse(tx: Transaction): ParsedTransaction | null {
		try {
			const base = this.createBaseResponse(tx);
			const { post_conditions } = tx;

			if (tx.tx_type !== "contract_call") return null;

			const { contract_call } = tx;

			switch (contract_call.function_name) {
				case "supply":
					return this.handleSupply(base, post_conditions);
				case "withdraw":
					return this.handleWithdraw(base, post_conditions);
				default:
					return {
						...base,
						action: "Contract Call",
						details: {},
						summary: `${tx.sender_address} called ${contract_call.contract_id}`,
					};
			}
		} catch (error) {
			console.error("Error parsing Zest transaction:", error);
			return null;
		}
	}

	private handleSupply(
		base: any,
		postConditions: PostCondition[],
	): ParsedTransaction | null {
		const sent = postConditions.find(
			(pc) => pc.condition_code === "sent_equal_to",
		);
		if (!sent) return null;

		const sentAsset = TransactionUtils.createAssetInfo(sent);
		if (!sentAsset) return null; // Handle null case for sent asset

		return {
			...base,
			action: "Supply",
			details: { sent: sentAsset },
			summary: `${base.sender} supplied ${sentAsset.amount} ${sentAsset.asset} to Zest.`,
		};
	}

	private handleWithdraw(
		base: any,
		postConditions: PostCondition[],
	): ParsedTransaction | null {
		const received = postConditions.find(
			(pc) => pc.condition_code === "sent_greater_than_or_equal_to",
		);
		if (!received) return null;

		const receivedAsset = TransactionUtils.createAssetInfo(received);
		if (!receivedAsset) return null; // Handle null case for received asset

		return {
			...base,
			action: "Withdraw",
			details: { received: receivedAsset },
			summary: `${base.sender} withdrew ${receivedAsset.amount} ${receivedAsset.asset} from Zest.`,
		};
	}
}
