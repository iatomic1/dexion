import { PROTOCOL_CONFIG } from "./config";
import type { AssetInfo, PostCondition } from "./types";

export class TransactionUtils {
	static formatAmount(amount: string, assetName: string): string {
		try {
			const decimals =
				PROTOCOL_CONFIG.tokens[assetName as keyof typeof PROTOCOL_CONFIG.tokens]
					?.decimals ?? 6;
			const num = Number(BigInt(amount)) / 10 ** decimals;
			return num.toLocaleString(undefined, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 4,
			});
		} catch (error) {
			console.warn(
				`Failed to format amount ${amount} for ${assetName}:`,
				error,
			);
			return "0.00";
		}
	}

	static getSimpleAssetName(pc: PostCondition): string {
		if (pc.type === "stx") return "STX";
		if (pc.type === "fungible") {
			const asset = pc.asset.asset_name || "Unknown";
			if (asset.toLowerCase().includes("usda")) return "USDA";
			if (asset.toLowerCase().includes("sbtc")) return "sBTC";
			return asset;
		}
		return "Unknown Token";
	}

	static getAssetContractId(pc: PostCondition): string {
		if (pc.type === "stx") {
			return PROTOCOL_CONFIG.tokens.STX.contractId;
		}
		if (pc.type === "fungible") {
			return `${pc.asset.contract_address}.${pc.asset.contract_name}`;
		}
		return "Unknown";
	}

	static getAssetNameForDecimals(pc: PostCondition): string {
		if (pc.type === "stx") return "STX";
		if (pc.type === "fungible") return pc.asset.contract_name;
		return "Unknown";
	}

	static createAssetInfo(pc: PostCondition): AssetInfo | null {
		// Check if this is an STX post condition
		if (pc.type === "stx") {
			return {
				asset: this.getSimpleAssetName(pc),
				amount: this.formatAmount(pc.amount, this.getAssetNameForDecimals(pc)),
				contractId: this.getAssetContractId(pc),
			};
		}

		// Check if this is a fungible token post condition
		if (pc.type === "fungible") {
			return {
				asset: this.getSimpleAssetName(pc),
				amount: this.formatAmount(pc.amount, this.getAssetNameForDecimals(pc)),
				contractId: this.getAssetContractId(pc),
			};
		}

		// For non-fungible or other types that don't have amount
		return null;
	}

	static findPostConditionBySender(
		postConditions: PostCondition[],
		senderAddress: string,
	) {
		return postConditions.find(
			(pc) =>
				((pc.principal.type_id === "principal_standard" ||
					pc.principal.type_id === "principal_contract") &&
					pc.principal.address === senderAddress) ||
				(pc.principal.type_id === "principal_origin" &&
					(pc.condition_code.includes("sent_equal_to") ||
						pc.condition_code.includes("sent_less_than_or_equal_to"))),
		);
	}

	static findPostConditionsByType(
		postConditions: PostCondition[],
		conditionCode: string,
	) {
		return postConditions.filter((pc) => pc.condition_code === conditionCode);
	}
}
