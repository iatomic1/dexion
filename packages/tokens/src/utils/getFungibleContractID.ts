import type { PostCondition } from "@stacks/transactions";

export function getFungibleContractId(postConditions: PostCondition[]) {
	const fungibleCondition = postConditions.find(
		(condition) => condition.type === "ft-postcondition",
	);

	if (fungibleCondition && fungibleCondition.asset) {
		const [contractId] = fungibleCondition.asset.split("::");
		return contractId;
	}

	return null;
}
//
export function extractTxIdFromChainHook(data: any) {}
