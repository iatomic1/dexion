"use client";

import type {
	PortfolioAddressData,
	PortfolioFungibleToken,
	TokenMetadata,
} from "@repo/tokens/types";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { Badge } from "@repo/ui/components/ui/badge";
import { Progress } from "@repo/ui/components/ui/progress";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { useIsMobile } from "@repo/ui/hooks/use-is-mobile";
import { cn } from "@repo/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { formatPrice } from "~/lib/helpers/numbers";
import { getUserPortfolio } from "~/lib/queries/token-watcher";
import { calculatePnl, calculateTokenValue } from "~/lib/utils/token";

export const tableColumns = (
	token: TokenMetadata,
	isMobile: boolean,
): ColumnDef<PortfolioFungibleToken>[] => [
	{
		accessorKey: "indexAndWallet",
		header: () => <div className={isMobile ? "w-32" : "w-48"}>Token</div>,
		cell: ({ row }) => {
			return (
				<div className="flex items-center gap-2 text-left">
					<Avatar className="h-8 w-8">
						<AvatarImage src={token.image_url} />
						<AvatarFallback>{token.symbol.charAt(0)}</AvatarFallback>
					</Avatar>
					<span className="text-xs font-medium">{token.name}</span>
				</div>
			);
		},
	},
	// {
	//   accessorKey: "balance",
	//   header: "STX Balance",
	//   cell: () => {
	//     return (
	//       <div className="text-xs font-geist-mono text-right xl:text-left">
	//         1.23k
	//       </div>
	//     );
	//   },
	// },
	{
		accessorKey: "bought",
		header: "Bought",
		cell: ({ row }) => {
			const totalSpentUsd = row.original.total_spent_usd;
			const credits = row.original.credits;
			const totalBuys = row.original.total_buys;

			return (
				<div className="flex flex-col">
					<span className="text-xs font-geist-mono text-emerald-500">
						${totalSpentUsd ? formatPrice(Number(totalSpentUsd)) : "..."}
					</span>
					<div className="text-[11px] text-muted-foreground">
						<span>
							{credits
								? formatPrice(Number(credits) / 10 ** token.decimals)
								: "..."}{" "}
							/{" "}
						</span>
						<span>{totalBuys ?? "..."}</span>
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "sold",
		header: "Sold",
		cell: ({ row }) => {
			const totalReceivedUsd = row.original.total_received_usd;
			const debits = row.original.debits;
			const totalSells = row.original.total_sells;

			return (
				<div className="flex flex-col">
					<span className="text-xs font-geist-mono text-destructive">
						${totalReceivedUsd ? formatPrice(Number(totalReceivedUsd)) : "..."}
					</span>
					<div className="text-[11px] text-muted-foreground">
						{debits
							? formatPrice(Number(debits) / 10 ** token.decimals)
							: "..."}{" "}
						/ <span>{totalSells ?? "..."}</span>
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "pnl",
		header: "PnL",
		cell: ({ row }) => {
			// @ts-expect-error Fix type Later
			const pnl = calculatePnl(row.original, token);

			// Determine color based on PnL value
			const colorClass =
				pnl.value > 0
					? "text-emerald-600"
					: pnl.value < 0
						? "text-destructive"
						: "text-muted-foreground";

			return (
				<div className={cn("text-xs font-geist-mono", colorClass)}>
					${pnl.formatted ?? "..."}
				</div>
			);
		},
	},
	{
		accessorKey: "remaining",
		header: "Remaining",
		cell: ({ row }) => {
			const data = row.original;

			const percentageHolding = data.balance
				? (Number(data.balance) / Number(token.total_supply)) * 100
				: 0;

			const tokenValue = calculateTokenValue(row.original.balance, token);

			return (
				<div className="text-xs font-geist-mono text-right flex flex-col gap-1">
					<div className="flex items-center gap-1 justify-end">
						<span>${tokenValue ? formatPrice(tokenValue) : "..."}</span>
						<Badge
							variant={"secondary"}
							className="rounded-sm text-[10px] font-light"
						>
							{percentageHolding ? formatPrice(percentageHolding) : "..."}%
						</Badge>
					</div>
					<Progress
						value={percentageHolding || 0}
						className="h-1 max-w-20 self-end"
					/>
				</div>
			);
		},
	},
];

export default function PositionsTable({
	token,
	userAddress,
}: {
	token: TokenMetadata;
	userAddress: string | null;
}) {
	const { data: positionsData, isLoading } = useQuery<PortfolioAddressData>({
		queryKey: ["userPortfolio", userAddress],
		queryFn: () => getUserPortfolio(userAddress as string),
		enabled: !!userAddress,
	});

	const currentTokenPosition = positionsData?.fungible_tokens?.find(
		(ft) =>
			ft.token.contract_id === token.contract_id && Number(ft.balance) > 0,
	);

	const isMobile = useIsMobile();

	const table = useReactTable({
		data: currentTokenPosition ? [currentTokenPosition] : [],
		columns: tableColumns(token, isMobile),
		getCoreRowModel: getCoreRowModel(),
	});

	// Don't render the table if loading or no data available
	if (isLoading) {
		return (
			<div className="flex h-full w-full flex-col border-t">
				<div className="flex h-24 w-full items-center justify-center">
					<span className="text-sm text-muted-foreground">Loading...</span>
				</div>
			</div>
		);
	}

	// Don't render if no position found
	if (!currentTokenPosition) {
		return (
			<div className="flex h-full w-full flex-col border-t">
				<div className="flex h-24 w-full items-center justify-center">
					<span className="text-sm text-muted-foreground">
						No position found for this token.
					</span>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full w-full flex-col border-t">
			{/* Header */}
			<div
				className={cn(
					"w-full border-b grid",
					isMobile ? "min-w-[800px]" : "",
					"grid-cols-6",
				)}
			>
				{table.getHeaderGroups().map((headerGroup) => (
					<div key={headerGroup.id} className="contents">
						{headerGroup.headers.map((header) => (
							<div
								key={header.id}
								className={cn(
									"py-3 px-4 text-xs font-medium text-muted-foreground",
									header.id === "remaining" && "text-right",
								)}
							>
								{header.isPlaceholder
									? null
									: flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
							</div>
						))}
					</div>
				))}
			</div>

			{/* Body */}
			<div className="relative flex-1 overflow-hidden">
				<ScrollArea className="h-full w-full">
					<div className={cn(isMobile ? "min-w-[800px]" : "")}>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row, index) => (
								<div
									key={row.id}
									className={cn(
										"grid w-full grid-cols-6 border-b items-center",
										index % 2 === 0 ? "bg-muted/50" : "",
									)}
								>
									{row.getVisibleCells().map((cell) => (
										<div key={cell.id} className="py-3 px-4">
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</div>
									))}
								</div>
							))
						) : (
							<div className="flex h-24 w-full items-center justify-center">
								<span className="text-sm text-muted-foreground">
									No results.
								</span>
							</div>
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
