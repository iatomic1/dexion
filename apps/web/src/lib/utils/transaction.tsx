import { Badge } from "@dexion/ui/components/ui/badge";
import type { Transaction } from "@stacks/blockchain-api-client";
import {
	ArrowDownLeft,
	ArrowLeftRight,
	ArrowUpRight,
	Code,
	ImageIcon,
	Lock,
	Plus,
	RefreshCw,
	Zap,
} from "lucide-react";

export const getParsedTransactionIcon = (
	action: string,
	isUserSender?: boolean,
	isUserRecipient?: boolean,
) => {
	switch (action.toLowerCase()) {
		case "stx transfer":
			if (isUserSender) return <ArrowUpRight className="h-4 w-4" />;
			if (isUserRecipient) return <ArrowDownLeft className="h-4 w-4" />;
			return <ArrowLeftRight className="h-4 w-4" />;

		case "token transfer":
			if (isUserSender) return <ArrowUpRight className="h-4 w-4" />;
			if (isUserRecipient) return <ArrowDownLeft className="h-4 w-4" />;
			return <ArrowLeftRight className="h-4 w-4" />;

		case "token swap":
			return <RefreshCw className="h-4 w-4" />;

		case "token creation":
		case "token mint":
			return <Plus className="h-4 w-4" />;

		case "contract deploy":
		case "contract deployment":
			return <Code className="h-4 w-4" />;

		case "nft mint":
		case "nft transfer":
			return <ImageIcon className="h-4 w-4" />;

		case "staking":
		case "delegate":
		case "stack":
			return <Lock className="h-4 w-4" />;

		case "contract call":
		case "function call":
			return <Zap className="h-4 w-4" />;

		default:
			return <ArrowUpRight className="h-4 w-4" />;
	}
};

export const getTransactionColor = (action: string) => {
	switch (action.toLowerCase()) {
		case "stx transfer":
			return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";

		case "token transfer":
			return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";

		case "token swap":
		case "swap":
			return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";

		case "token creation":
		case "token mint":
		case "mint":
			return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";

		case "contract deploy":
		case "contract deployment":
			return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";

		case "nft mint":
		case "nft transfer":
			return "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300";

		case "staking":
		case "delegate":
		case "stack":
			return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";

		case "contract call":
		case "function call":
			return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300";

		case "multisig":
			return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";

		default:
			return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
	}
};

export const getStatusBadge = (status: Transaction["tx_status"]) => {
	switch (status) {
		case "success":
			return (
				<Badge
					variant="default"
					className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
				>
					Confirmed
				</Badge>
			);
		case "abort_by_post_condition":
		case "abort_by_response":
			return <Badge variant="destructive">Failed</Badge>;
		default:
			return (
				<Badge
					variant="secondary"
					className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
				>
					Pending
				</Badge>
			);
	}
};

// export const formatTransactionType = (type: Transaction["tx_type"]) => {
//   switch (type) {
//     case "":
//       return "STX Transfer";
//     case "token_transfer":
//       return "Token Transfer";
//     case "token_swap":
//       return "Token Swap";
//     case "token_creation":
//       return "Token Creation";
//     case "contract_deploy":
//       return "Contract Deploy";
//     case "nft_mint":
//       return "NFT Mint";
//     case "staking":
//       return "Staking";
//     case "contract_call":
//       return "Contract Call";
//     case "multisig":
//       return "Multi-sig";
//     default:
//       return "Unknown";
//   }
// };

export const formatTimestamp = (timestamp: string) => {
	return new Date(timestamp).toLocaleString();
};

export const formatTimeAgo = (timestamp: string) => {
	const now = new Date();
	const txTime = new Date(timestamp);
	const diffInHours = Math.floor(
		(now.getTime() - txTime.getTime()) / (1000 * 60 * 60),
	);

	if (diffInHours < 1) return "Just now";
	if (diffInHours < 24) return `${diffInHours}h ago`;
	const diffInDays = Math.floor(diffInHours / 24);
	return `${diffInDays}d ago`;
};

export const truncateAddress = (address: string) => {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getTokenImage = (token?: string) => {
	if (!token) return null;
	return `/placeholder.svg?height=24&width=24&text=${token}`;
};
