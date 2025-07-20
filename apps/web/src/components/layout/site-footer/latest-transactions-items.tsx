"use client";

import { EXPLORER_BASE_URL } from "@repo/shared-constants/constants.ts";
import { type ParsedTransaction } from "@repo/tokens/parser";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { toast } from "@repo/ui/components/ui/sonner";
import { cn } from "@repo/ui/lib/utils";
import { Copy, ExternalLink } from "lucide-react";
import useCopyToClipboard from "~/hooks/useCopy";
import openInNewPage from "~/lib/helpers/openInNewPage";
import {
	getParsedTransactionIcon,
	getTokenImage,
	getTransactionColor,
	truncateAddress,
} from "~/lib/utils/transaction";

interface CompactViewProps {
	transaction: ParsedTransaction;
	index: number;
	walletAddress: string; // Add this prop to know the current user's address
}

export function CompactView({
	transaction,
	index,
	walletAddress,
}: CompactViewProps) {
	const copy = useCopyToClipboard();
	const isUserSender = transaction.sender === walletAddress;
	const isUserRecipient = transaction.details.recipient === walletAddress;

	const getStatusBadgeForParsed = (status: ParsedTransaction["status"]) => {
		switch (status) {
			case "success":
				return (
					<Badge
						variant="default"
						// className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
					>
						Success
					</Badge>
				);
			case "abort_by_response":
			case "abort_by_post_condition":
				return <Badge variant="destructive">Failed</Badge>;
			default:
				return (
					<Badge
						variant="secondary"
						// className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
					>
						Pending
					</Badge>
				);
		}
	};

	return (
		<div
			className={cn(
				"flex items-center space-x-3 p-3 hover:bg-muted transition-colors",
				index % 2 === 0 ? "bg-background" : "bg-muted/30",
			)}
		>
			<div className="flex items-center space-x-2">
				<Avatar
					className={`h-8 w-8 ${getTransactionColor(transaction.action as any)}`}
				>
					<AvatarFallback
						className={getTransactionColor(transaction.action as any)}
					>
						{getParsedTransactionIcon(
							transaction.action,
							isUserSender,
							isUserRecipient,
						)}
					</AvatarFallback>
				</Avatar>
				{(transaction.details.sent?.asset ||
					transaction.details.received?.asset) && (
					<Avatar className="h-6 w-6">
						<AvatarImage
							src={
								getTokenImage(
									transaction.details.sent?.asset ||
										transaction.details.received?.asset,
								) || "/placeholder.svg"
							}
							alt={
								transaction.details.sent?.asset ||
								transaction.details.received?.asset
							}
						/>
						<AvatarFallback className="text-xs">
							{(
								transaction.details.sent?.asset ||
								transaction.details.received?.asset
							)?.slice(0, 2)}
						</AvatarFallback>
					</Avatar>
				)}
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between mb-1">
					<div className="flex items-center space-x-2">
						<h4 className="font-medium text-xs truncate">
							{transaction.action}
						</h4>
						{getStatusBadgeForParsed(transaction.status)}
					</div>
					<div className="text-xs text-muted-foreground whitespace-nowrap">
						{transaction.protocol}
					</div>
				</div>

				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<div className="flex items-center space-x-4 min-w-0">
						{/* Show based on user perspective */}
						{isUserSender && transaction.details.sent && (
							<span className="font-medium text-red-600">
								-{transaction.details.sent.amount}{" "}
								{transaction.details.sent.asset}
							</span>
						)}
						{isUserRecipient && transaction.details.sent && (
							<span className="font-medium text-primary">
								+{transaction.details.sent.amount}{" "}
								{transaction.details.sent.asset}
							</span>
						)}
						{/* Handle other transaction types that might have received details */}
						{transaction.details.received && (
							<span className="font-medium text-primary">
								+{transaction.details.received.amount}{" "}
								{transaction.details.received.asset}
							</span>
						)}

						{/* Show the other party's address */}
						{isUserSender && transaction.details.recipient && (
							<span className="font-mono truncate">
								→ {truncateAddress(transaction.details.recipient)}
							</span>
						)}
						{isUserRecipient && (
							<span className="font-mono truncate">
								← {truncateAddress(transaction.sender)}
							</span>
						)}

						{transaction.contract && (
							<span className="font-mono truncate">
								{transaction.contract.function}
							</span>
						)}
					</div>

					<div className="flex items-center space-x-1 ml-2">
						<Button
							variant="ghost"
							size="sm"
							className="h-5 w-5 p-0"
							onClick={() => {
								copy(transaction.txId);
								toast.copy("Transaction ID copied to clipboard");
							}}
						>
							<Copy className="h-3 w-3" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="h-5 w-5 p-0"
							onClick={() =>
								openInNewPage(`${EXPLORER_BASE_URL}txid/${transaction.txId}`)
							}
						>
							<ExternalLink className="h-3 w-3" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
