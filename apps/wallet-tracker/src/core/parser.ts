import type { MempoolTransaction } from "@stacks/blockchain-api-client";

type PostCondition = MempoolTransaction["post_conditions"][number];

const STX_CONTRACT_ID = "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx";

// Secure mapping of full contract identifiers to protocols
const contractToProtocol: Record<string, string> = {
	"SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v4":
		"StackingDAO",
	"SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststxbtc-tracking": "StackingDAO",
	"SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.multihop": "ALEX",
	"SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY.path-apply_staging": "Velar",
	"SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY.path-apply": "Velar",
	"SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.borrow-helper-v2-1-4": "Zest",
	"SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-stx-ststx-v-1-2":
		"Bitflow",
};

// Mapping of asset contract names to their decimal precision
const tokenDecimals: Record<string, number> = {
	STX: 6,
	"sbtc-token": 8,
	"usda-token": 6,
	"token-aeusdc": 6,
	crystals: 6,
	"drones-stxcity": 6,
	"ststx-token": 6,
};

// Formats a raw amount string into a human-readable number string
function formatAmount(amount: string, assetName: string): string {
	const decimals = tokenDecimals[assetName] ?? 6; // Default to 6 if unknown
	const num = Number(BigInt(amount)) / 10 ** decimals;
	return num.toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 4,
	});
}

// Extracts a simplified, human-readable asset name from a post-condition
function getSimpleAssetName(pc: PostCondition): string {
	if (pc.type === "stx") return "STX";
	if (pc.type === "fungible") {
		const asset = pc.asset.asset_name || "Unknown";
		if (asset.toLowerCase().includes("usda")) return "USDA";
		if (asset.toLowerCase().includes("sbtc")) return "sBTC";
		return asset;
	}
	return "Unknown Token";
}

function getAssetContractId(pc: PostCondition): string {
	if (pc.type === "stx") return STX_CONTRACT_ID;
	if (pc.type === "fungible")
		return `${pc.asset.contract_address}.${pc.asset.contract_name}`;
	return "Unknown";
}

// Gets the correct asset name for looking up decimals
function getAssetNameForDecimals(pc: PostCondition): string {
	if (pc.type === "stx") return "STX";
	if (pc.type === "fungible") return pc.asset.contract_name;
	return "Unknown";
}

// Main function to generate a structured message from a transaction
export function generateTransactionMessage(
	tx: MempoolTransaction,
): object | null {
	const { sender_address, post_conditions, tx_id } = tx;

	// Handle simple STX transfers first
	if (tx.tx_type === "token_transfer") {
		const amount = formatAmount(tx.token_transfer.amount, "STX");
		return {
			txId: tx_id,
			protocol: "Stacks",
			action: "STX Transfer",
			sender: sender_address,
			details: {
				sent: { asset: "STX", amount, contractId: STX_CONTRACT_ID },
				recipient: tx.token_transfer.recipient_address,
			},
			summary: `${sender_address} sent ${amount} STX to ${tx.token_transfer.recipient_address}`,
		};
	}

	// Process contract calls
	if (tx.tx_type === "contract_call" && tx.contract_call) {
		const { contract_id, function_name } = tx.contract_call;
		const protocol = contractToProtocol[contract_id] || "Unknown Protocol";

		const baseResponse = {
			txId: tx_id,
			sender: sender_address,
			contract: {
				id: contract_id,
				function: function_name,
			},
		};

		// --- Protocol-Specific Handlers ---

		// Swaps (Velar, ALEX, Bitflow)
		if (
			(protocol === "Velar" && function_name === "apply") ||
			(protocol === "ALEX" && function_name.startsWith("swap-")) ||
			(protocol === "Bitflow" && function_name.startsWith("swap-"))
		) {
			const sent = post_conditions.find(
				(pc) =>
					((pc.principal.type_id === "principal_standard" ||
						pc.principal.type_id === "principal_contract") &&
						pc.principal.address === sender_address) ||
					(pc.principal.type_id === "principal_origin" &&
						(pc.condition_code.includes("sent_equal_to") ||
							pc.condition_code.includes("sent_less_than_or_equal_to"))),
			);
			const receivedList = post_conditions.filter(
				(pc) => pc.principal.type_id === "principal_contract",
			);

			if (
				sent &&
				receivedList.length > 0 &&
				(sent.type === "stx" || sent.type === "fungible")
			) {
				const received = receivedList[receivedList.length - 1];
				if (received.type !== "stx" && received.type !== "fungible")
					return null;
				const sentAsset = getSimpleAssetName(sent);
				const sentAmount = formatAmount(
					sent.amount,
					getAssetNameForDecimals(sent),
				);
				const sentContractId = getAssetContractId(sent);
				const receivedAsset = getSimpleAssetName(received);
				const receivedAmount = formatAmount(
					received.amount,
					getAssetNameForDecimals(received),
				);
				const receivedContractId = getAssetContractId(received);

				return {
					...baseResponse,
					protocol,
					action: "Swap",
					details: {
						sent: {
							asset: sentAsset,
							amount: sentAmount,
							contractId: sentContractId,
						},
						received: {
							asset: receivedAsset,
							amount: receivedAmount,
							contractId: receivedContractId,
						},
					},
					summary: `${sender_address} swapped ~${sentAmount} ${sentAsset} for ~${receivedAmount} ${receivedAsset} on ${protocol}.`,
				};
			}
		}

		// StackingDAO
		if (protocol === "StackingDAO") {
			if (function_name === "deposit") {
				const sent = post_conditions.find((pc) => pc.type === "stx");
				if (sent) {
					const sentAmount = formatAmount(sent.amount, "STX");
					return {
						...baseResponse,
						protocol,
						action: "Deposit",
						details: {
							sent: {
								asset: "STX",
								amount: sentAmount,
								contractId: STX_CONTRACT_ID,
							},
						},
						summary: `${sender_address} deposited ${sentAmount} STX to StackingDAO.`,
					};
				}
			} else if (function_name === "claim-pending-rewards-many") {
				const claimed = post_conditions.find(
					(pc) => pc.condition_code === "sent_greater_than_or_equal_to",
				);
				if (claimed) {
					const receivedAsset = getSimpleAssetName(claimed);
					const receivedAmount = formatAmount(
						claimed.amount,
						getAssetNameForDecimals(claimed),
					);
					const receivedContractId = getAssetContractId(claimed);
					return {
						...baseResponse,
						protocol,
						action: "Claim Rewards",
						details: {
							received: {
								asset: receivedAsset,
								amount: receivedAmount,
								contractId: receivedContractId,
							},
						},
						summary: `${sender_address} claimed ${receivedAmount} ${receivedAsset} from StackingDAO.`,
					};
				}
			}
		}

		// Zest Protocol
		if (protocol === "Zest") {
			const sent = post_conditions.find(
				(pc) => pc.condition_code === "sent_equal_to",
			);
			const received = post_conditions.find(
				(pc) => pc.condition_code === "sent_greater_than_or_equal_to",
			);

			if (function_name === "supply" && sent) {
				const sentAsset = getSimpleAssetName(sent);
				const sentAmount = formatAmount(
					sent.amount,
					getAssetNameForDecimals(sent),
				);
				const sentContractId = getAssetContractId(sent);
				return {
					...baseResponse,
					protocol,
					action: "Supply",
					details: {
						sent: {
							asset: sentAsset,
							amount: sentAmount,
							contractId: sentContractId,
						},
					},
					summary: `${sender_address} supplied ${sentAmount} ${sentAsset} to Zest.`,
				};
			}
			if (function_name === "withdraw" && received) {
				const receivedAsset = getSimpleAssetName(received);
				const receivedAmount = formatAmount(
					received.amount,
					getAssetNameForDecimals(received),
				);
				const receivedContractId = getAssetContractId(received);
				return {
					...baseResponse,
					protocol,
					action: "Withdraw",
					details: {
						received: {
							asset: receivedAsset,
							amount: receivedAmount,
							contractId: receivedContractId,
						},
					},
					summary: `${sender_address} withdrew ${receivedAmount} ${receivedAsset} from Zest.`,
				};
			}
		}

		// Fallback for any other contract call
		return {
			...baseResponse,
			protocol,
			action: "Contract Call",
			summary: `${sender_address} called ${contract_id}`,
		};
	}

	// Return null if the transaction type is not supported
	return null;
}
