"use client";

import type { TokenMetadata, TokenSwapTransaction } from "@repo/tokens/types";
import { Button } from "@repo/ui/components/ui/button";
import { ScrollArea, ScrollBar } from "@repo/ui/components/ui/scroll-area";
import { useIsMobile } from "@repo/ui/hooks/use-is-mobile";
import { cn } from "@repo/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useTokenTrades } from "~/contexts/TokenWatcherSocketContext";
import { truncateString } from "~/lib/helpers/strings";
import { getFilterTrades } from "~/lib/queries/token-watcher";
import TradesTableSkeleton from "../skeleton/trades-table-skeleton";
import { columns, getColumnWidth } from "./trades-table-columns";

export default function TradesTable({
	token,
	onFilterChange,
	initialFilterValue = "",
}: {
	token: TokenMetadata;
	onFilterChange: (_filterValue: string) => void;
	initialFilterValue?: string;
}) {
	const { data: trades, isLoading: isTradesLoading } = useTokenTrades();
	const [filterBy, setFilterBy] = useState(initialFilterValue);
	const isMobile = useIsMobile();
	const velarPoolId = `VELAR_${token?.contract_id}_stx`;
	const { data: filteredTrades, isLoading: isFilterLoading } = useQuery({
		queryKey: ["trades", token?.contract_id, filterBy],
		queryFn: () => getFilterTrades(filterBy, velarPoolId as string),
		enabled: !!token && !!filterBy && !!velarPoolId,
	});

	const [tableData, setTableData] = useState<TokenSwapTransaction[]>([]);

	useEffect(() => {
		let currentData: TokenSwapTransaction[] = [];
		if (filterBy && !isFilterLoading && filteredTrades?.data) {
			currentData = filteredTrades.data as TokenSwapTransaction[];
		} else if (trades) {
			currentData = trades;
		}
		setTableData(currentData);
	}, [trades, filteredTrades, isFilterLoading, filterBy]);

	useEffect(() => {
		if (filteredTrades?.data) {
			console.log("filteredTrades.data structure:", filteredTrades.data);
		}
	}, [filteredTrades]);

	// Set initial filter value when it changes from parent
	useEffect(() => {
		if (initialFilterValue !== filterBy) {
			setFilterBy(initialFilterValue);
		}
	}, [initialFilterValue]);

	const handleFilterClick = (address: string) => {
		setFilterBy(address);
		onFilterChange(address); // Propagate filter change to parent
	};

	// Get visible columns based on screen size
	const getVisibleColumns = () => {
		const allColumns = columns(token, handleFilterClick);
		// If mobile, filter out 'type' and 'amount' columns
		return isMobile
			? allColumns.filter((col) => col.id !== "type" && col.id !== "amount")
			: allColumns;
	};

	const table = useReactTable({
		data: tableData,
		columns: getVisibleColumns(),
		getCoreRowModel: getCoreRowModel(),
	});

	if (isFilterLoading || isTradesLoading || !token) {
		return <TradesTableSkeleton />;
	}

	return (
		<div className="flex h-full w-full flex-col border-t">
			{filterBy && filteredTrades?.rowCount && filteredTrades.rowCount > 0 && (
				<div className="flex items-center justify-between px-4 py-1">
					<span className="text-xs font-geist-mono text-muted-foreground truncate max-w-[70%]">
						Showing {filteredTrades?.data?.length || 0} transactions of maker{" "}
						{truncateString(filterBy, isMobile ? 6 : 10, 4)}
					</span>
					<Button
						variant={"ghost"}
						size={"sm"}
						className="text-xs font-geist-mono text-indigo-500 h-7"
						onClick={() => handleFilterClick("")}
					>
						RESET
					</Button>
				</div>
			)}

			{/* Table container with horizontal scroll */}
			<div className="relative flex-1 overflow-hidden">
				<ScrollArea className="h-full w-full">
					<div className={cn("min-w-full", isMobile ? "min-w-[500px]" : "")}>
						{/* Header */}
						<div className="w-full border-b grid grid-cols-6">
							{table.getHeaderGroups().map((headerGroup) => (
								<div key={headerGroup.id} className="contents">
									{headerGroup.headers.map((header) => (
										<div
											key={header.id}
											className={cn(
												"py-3 px-3 text-xs font-medium text-muted-foreground whitespace-nowrap",
												header.column.id === "totalUsd"
													? "text-right"
													: header.column.id === "trader"
														? "text-right"
														: "text-left",
											)}
											style={{
												width: getColumnWidth(header.column.id, isMobile),
											}}
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
						<div className="w-full">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row, index) => (
									<div
										key={row.id}
										className={cn(
											"grid grid-cols-6 w-full border-b items-center",
											index % 2 === 0 ? "bg-muted/50" : "",
										)}
									>
										{row.getVisibleCells().map((cell) => (
											<div
												key={cell.id}
												className={cn(
													"py-3 px-3 truncate",
													cell.column.id === "totalUsd"
														? "text-right"
														: cell.column.id === "trader"
															? "text-right"
															: "text-left",
												)}
												style={{
													width: getColumnWidth(cell.column.id, isMobile),
												}}
											>
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
					</div>
					<ScrollBar orientation="vertical" />
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			</div>
		</div>
	);
}
