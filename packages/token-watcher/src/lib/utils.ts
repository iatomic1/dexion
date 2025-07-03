import type {
  FungiblePostCondition,
  PostCondition,
} from "@stacks/transactions";

export function getContractIdsFromPostConditions(
  postConditions: PostCondition[],
): string[] {
  const contractIds = new Set<string>();

  for (const pc of postConditions) {
    if (pc.type === "ft-postcondition") {
      // FungiblePostCondition
      const fungiblePC = pc as FungiblePostCondition;
      const fullAddress = `${fungiblePC.asset}`;
      contractIds.add(fullAddress);
    }
  }

  return Array.from(contractIds);
}
