
import type {
  MempoolTransaction,
  PostCondition,
} from "@stacks/blockchain-api-client";

// Helper to get the contract name from a full contract identifier
const getContractName = (contractId: string) => contractId.split(".")[1];

// Mapping of contract names to protocols
const contractToProtocol: Record<string, string> = {
  "stacking-dao-core-v4": "StackingDAO",
  multihop: "ALEX",
  "path-apply_staging": "Velar",
  "path-apply": "Velar",
};

// Mapping of asset names to their decimal precision
const tokenDecimals: Record<string, number> = {
  STX: 6,
  "sbtc-token": 8,
  usda: 6,
  "usda-token": 6,
  aeUSDC: 6,
  "token-aeusdc": 6,
  CRYS: 6,
  crystals: 6,
  UAP: 6,
  "drones-stxcity": 6,
  ststx: 6,
};

// Formats a raw amount string into a human-readable number string
function formatAmount(amount: string, assetName: string): string {
  const decimals = tokenDecimals[assetName] ?? 6;
  const num = Number(BigInt(amount)) / 10 ** decimals;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

// Extracts a simplified asset name from a post-condition
function getSimpleAssetName(pc: PostCondition): string {
  if (pc.type === "stx") return "STX";
  if (pc.type === "fungible") {
    const asset = pc.asset.asset_name.split("::")[1] || "Unknown";
    if (asset.toLowerCase().includes("usda")) return "USDA";
    if (asset.toLowerCase().includes("sbtc")) return "sBTC";
    return asset;
  }
  return "Unknown Token";
}

// Extracts the contract name from a fungible token post-condition
function getAssetNameFromFungible(pc: PostCondition): string {
  if (pc.type === "stx") return "STX";
  return pc.type === "fungible" ? pc.asset.contract_name : "Unknown";
}

// Main function to generate a structured message from a transaction
export function generateTransactionMessage(
  tx: MempoolTransaction,
): object | null {
  if (tx.tx_type !== "contract_call" || !tx.contract_call) {
    return {
      protocol: "Stacks",
      action: tx.tx_type.replace("_", " ").toUpperCase(),
      sender: tx.sender_address,
      summary: `Address ${tx.sender_address} initiated a ${tx.tx_type} transaction.`,
    };
  }

  const { contract_call, sender_address, post_conditions } = tx;
  const { contract_id, function_name } = contract_call;
  const shortAddress = `${sender_address.slice(0, 5)}...${sender_address.slice(
    -5,
  )}`;
  const contractName = getContractName(contract_id);
  const protocol = contractToProtocol[contractName] || "Unknown Protocol";

  // Generic handler for swaps
  const handleSwap = (sent: PostCondition, received: PostCondition[]) => {
    const sentAsset = getSimpleAssetName(sent);
    const sentAssetName = getAssetNameFromFungible(sent);
    const sentAmount = formatAmount(sent.amount, sentAssetName);

    const receivedFiltered = received.filter(
      (r) => getSimpleAssetName(r) !== sentAsset,
    );
    if (receivedFiltered.length > 0) {
      const receivedCond = receivedFiltered[receivedFiltered.length - 1];
      const receivedAsset = getSimpleAssetName(receivedCond);
      const receivedAssetName = getAssetNameFromFungible(receivedCond);
      const receivedAmount = formatAmount(
        receivedCond.amount,
        receivedAssetName,
      );
      return {
        protocol,
        action: "Swap",
        sender: shortAddress,
        sent: { asset: sentAsset, amount: sentAmount },
        received: { asset: receivedAsset, amount: receivedAmount },
        summary: `${shortAddress} swapped ~${sentAmount} ${sentAsset} for ~${receivedAmount} ${receivedAsset} on ${protocol}.`,
      };
    }
    return null;
  };

  // Velar & ALEX Swaps
  if (
    (contractName.includes("path-apply") && function_name === "apply") ||
    (contractName.includes("multihop") && function_name.startsWith("swap-"))
  ) {
    const sentCondition = post_conditions.find(
      (pc) =>
        pc.principal.address === sender_address &&
        (pc.condition_code.includes("sent_equal_to") ||
          pc.condition_code.includes("sent_less_than_or_equal_to")),
    );
    const receivedConditions = post_conditions.filter(
      (pc) =>
        pc.principal.type_id === "principal_contract" &&
        pc.condition_code.includes("sent_greater_than_or_equal_to") &&
        BigInt(pc.amount) > 0,
    );

    if (sentCondition && receivedConditions.length > 0) {
      return handleSwap(sentCondition, receivedConditions);
    }
  }

  // StackingDAO Deposit
  if (
    contractName.includes("stacking-dao-core") &&
    function_name === "deposit"
  ) {
    const sentCondition = post_conditions.find(
      (pc) =>
        pc.principal.address === sender_address &&
        pc.condition_code === "sent_equal_to" &&
        pc.type === "stx",
    );
    if (sentCondition) {
      const sentAmount = formatAmount(sentCondition.amount, "STX");
      return {
        protocol,
        action: "Deposit",
        sender: shortAddress,
        sent: { asset: "STX", amount: sentAmount },
        summary: `${shortAddress} deposited ${sentAmount} STX to StackingDAO.`,
      };
    }
  }

  // Fallback for other contract calls
  return {
    protocol,
    action: "Contract Call",
    sender: shortAddress,
    contract: contractName,
    function: function_name,
    summary: `${shortAddress} called ${function_name} on ${contractName}.`,
  };
}
