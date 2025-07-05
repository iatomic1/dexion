"use client";

import { EXPLORER_BASE_URL } from "@repo/shared-constants/constants.ts";
import type { TokenMetadata, TokenSwapTransaction } from "@repo/tokens/types";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, FilterIcon as Funnel, Worm } from "lucide-react";
import { formatRelativeTime } from "~/lib/helpers/dayjs";
import { formatPrice } from "~/lib/helpers/numbers";
import openInNewPage from "~/lib/helpers/openInNewPage";
import { truncateString } from "~/lib/helpers/strings";
import {
	calculateMarketCap,
	calculateTokenValue,
	determineTransactionType,
} from "~/lib/utils/token";
import { CryptoHoverCard } from "../trade-details";

// Helper function to define consistent column widths
export function getColumnWidth(columnId: string): string {
	switch (columnId) {
		case "timestamp":
			return "100px";
		case "type":
			return "80px";
		case "mc":
			return "100px";
		case "amount":
			return "100px";
		case "totalUsd":
			return "100px";
		case "trader":
			return "100%";
		default:
			return "auto";
	}
}
const _foo = 123;

type FilterFn = (address: string) => void;
export const columns = (
	token: TokenMetadata,
	onFilterClick: FilterFn,
): ColumnDef<TokenSwapTransaction>[] => [
	{
		accessorKey: "timestamp",
		header: "Age / Time",
		cell: ({ row }) => (
			<div className="text-xs font-geist-mono">{row.getValue("timestamp")}</div>
		),
		accessorFn: (row) => {
			return formatRelativeTime(
				new Date(row.burn_block_time * 1000).toISOString(),
			);
		},
	},
	{
		accessorKey: "type",
		header: "Type",
		cell: ({ row }) => {
			const type = row.getValue("type") as string;
			return (
				<div
					className={`text-xs font-geist-mono ${type === "Buy" ? "text-green-500" : "text-destructive"}`}
				>
					{type}
				</div>
			);
		},
		accessorFn: (row) => determineTransactionType(row, token),
	},
	{
		accessorKey: "mc",
		header: "MC",
		cell: ({ row }) => {
			const mc = Number.parseFloat(row.getValue("mc"));
			return <div className="text-xs font-geist-mono">{formatPrice(mc)}</div>;
		},
		accessorFn: (row) => calculateMarketCap(token, row.price_usd),
	},
	{
		accessorKey: "amount",
		header: "Amount",
		cell: ({ row }) => {
			const amount = Number.parseFloat(row.getValue("amount"));
			return (
				<div className="text-xs font-geist-mono text-right">
					{formatPrice(amount)}
				</div>
			);
		},
		accessorFn: (row) => {
			const type = determineTransactionType(row, token);
			// Choose the appropriate token amount based on buy/sell
			if (type === "Buy") {
				return (
					Number.parseFloat(
						row.token_y.contract_id === token.contract_id
							? row.token_y_amount
							: row.token_x_amount,
					) /
					10 ** token.decimals
				);
			}
			return (
				Number.parseFloat(
					row.token_x.contract_id === token.contract_id
						? row.token_x_amount
						: row.token_y_amount,
				) /
				10 ** token.decimals
			);
		},
	},
	{
		accessorKey: "totalUsd",
		header: "Total USD",
		cell: ({ row }) => {
			const amount = Number.parseFloat(row.getValue("totalUsd"));

			return (
				<div
					className={`text-xs font-geist-mono text-center ${
						determineTransactionType(row.original, token) === "Buy"
							? "text-green-500"
							: "text-destructive"
					}`}
				>
					${formatPrice(amount)}
				</div>
			);
		},
		accessorFn: (row) => row.volume_usd,
	},
	{
		accessorKey: "trader",
		header: "Trader",
		cell: ({ row }) => {
			const wallet = row.original.wallet;
			const ft = wallet?.fungible_tokens?.[0];
			const bns = wallet.bns;
			const address = wallet.address;

			return (
				<div className="flex items-center gap-2 text-right justify-end">
					{ft && (
						<Tooltip>
							<TooltipTrigger>
								{(!ft?.total_buys || ft?.total_buys === "0") && (
									<Worm className="h-3 w-3" />
								)}
							</TooltipTrigger>
							<TooltipContent>Insider</TooltipContent>
						</Tooltip>
					)}

					{ft ? (
						<CryptoHoverCard
							address={address}
							bns={bns}
							ft={ft as TokenSwapTransaction["wallet"]["fungible_tokens"][0]}
							decimals={token.decimals}
							valueUsd={calculateTokenValue(ft?.balance as string, token)}
							percentageHolding={
								ft ? (Number(ft.balance) / Number(token.total_supply)) * 100 : 0
							}
							txId={row.original.tx_id}
						>
							<div className="text-xs font-geist-mono hover:underline">
								{bns ? bns : truncateString(address, 8, 5)}
							</div>
						</CryptoHoverCard>
					) : (
						<div className="text-xs font-geist-mono hover:underline">
							{bns ? bns : truncateString(address, 8, 5)}
						</div>
					)}

					<Tooltip>
						<TooltipTrigger
							onClick={() => {
								openInNewPage(`${EXPLORER_BASE_URL}txid/${row.original.tx_id}`);
							}}
						>
							<ExternalLink className="h-3 w-3 text-muted-foreground" />
						</TooltipTrigger>
						<TooltipContent>Open in Exp.</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger
							onClick={() => {
								onFilterClick(address);
								console.log("clicked from columns");
							}}
						>
							<Funnel className="h-3 w-3 text-muted-foreground" />
						</TooltipTrigger>
						<TooltipContent>Filter by address</TooltipContent>
					</Tooltip>
				</div>
			);
		},
	},
];
