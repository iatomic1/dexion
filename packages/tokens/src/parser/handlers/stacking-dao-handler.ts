import type { Transaction } from "@stacks/blockchain-api-client";
import type { ParsedTransaction, PostCondition } from "../types";
import { TransactionUtils } from "../utils";
import { BaseProtocolHandler } from "./base-handler";

export class StackingDAOHandler extends BaseProtocolHandler {
	constructor() {
		super("StackingDAO", ["stacking-dao-core", "ststxbtc-tracking"]);
	}

	parse(tx: Transaction): ParsedTransaction | null {
		try {
			const base = this.createBaseResponse(tx);
			const { post_conditions } = tx;

			// Type guard to ensure we have a contract call transaction
			if (tx.tx_type !== "contract_call") return null;

			const { contract_call } = tx;

			switch (contract_call.function_name) {
				case "deposit":
					return this.handleDeposit(base, post_conditions);
				case "claim-pending-rewards-many":
					return this.handleClaimRewards(base, post_conditions);
				default:
					return {
						...base,
						action: "Contract Call",
						details: {},
						summary: `${tx.sender_address} called ${contract_call.contract_id}`,
					};
			}
		} catch (error) {
			console.error("Error parsing StackingDAO transaction:", error);
			return null;
		}
	}

	private handleDeposit(
		base: any,
		postConditions: PostCondition[],
	): ParsedTransaction | null {
		const sent = postConditions.find((pc) => pc.type === "stx");
		if (!sent) return null;

		const sentAsset = TransactionUtils.createAssetInfo(sent);
		if (!sentAsset) return null; // Handle null case

		return {
			...base,
			action: "Deposit",
			details: { sent: sentAsset },
			summary: `${base.sender} deposited ${sentAsset.amount} ${sentAsset.asset} to StackingDAO.`,
		};
	}

	private handleClaimRewards(
		base: any,
		postConditions: PostCondition[],
	): ParsedTransaction | null {
		const claimed = postConditions.find(
			(pc) => pc.condition_code === "sent_greater_than_or_equal_to",
		);
		if (!claimed) return null;

		const receivedAsset = TransactionUtils.createAssetInfo(claimed);
		if (!receivedAsset) return null; // Handle null case

		return {
			...base,
			action: "Claim Rewards",
			details: { received: receivedAsset },
			summary: `${base.sender} claimed ${receivedAsset.amount} ${receivedAsset.asset} from StackingDAO.`,
		};
	}
}
