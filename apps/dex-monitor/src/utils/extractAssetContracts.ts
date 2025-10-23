import type { PostCondition } from "@repo/tokens/parser";

export function extractAssetContracts(
	postConditions: PostCondition[],
): string[] {
	const contracts = new Set<string>();

	for (const condition of postConditions) {
		if (condition.type === "fungible") {
			if (condition.asset) {
				const { contract_address, contract_name } = condition.asset;
				const contractIdentifier = `${contract_address}.${contract_name}`;
				contracts.add(contractIdentifier);
			}
		}
	}

	return Array.from(contracts);
}
