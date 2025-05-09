export function getFungibleContractId(postConditions) {
  const fungibleCondition = postConditions.find(
    (condition) => condition.type === "fungible",
  );

  if (fungibleCondition && fungibleCondition.asset) {
    const { contract_address, contract_name } = fungibleCondition.asset;
    return `${contract_address}.${contract_name}`;
  }

  return null;
}
//
export function extractTxIdFromChainHook(data: any) {}
