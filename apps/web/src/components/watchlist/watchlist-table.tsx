"use client";
import type { TokenMetadata } from "@repo/tokens/types";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { toast } from "@repo/ui/components/ui/sonner";
import { cn } from "@repo/ui/lib/utils";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import type React from "react";
import { revalidateTagServer } from "~/app/actions/revalidate";
import {
	useWatchlistActions,
	useWatchlistData,
} from "~/contexts/WatchlistContext";
import { formatPrice } from "~/lib/helpers/numbers";

// Dynamic column definition with removeFromWatchlist action
export const createTableColumns = (
	removeFromWatchlist,
): ColumnDef<TokenMetadata>[] => [
	{
		accessorKey: "token",
		header: () => <div className={cn("w-32 sm:w-48")}>Token</div>,
		cell: ({ row }) => {
			const t = row.original;

			return (
				<div className="flex items-center gap-2 text-left">
					<Avatar className="h-11 w-11 rounded-md">
						<AvatarImage
							src={t.image_url || "/placeholder.svg"}
							className="object-cover"
							fetchPriority="high"
						/>
						<AvatarFallback>{t.symbol.charAt(0)}</AvatarFallback>
					</Avatar>
					<div className="flex flex-col justify-between">
						<span className="text-sm font-medium">{t.symbol}</span>
						<span className="text-muted-foreground text-xs truncate max-w-[50px]">
							{t.name}
						</span>
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "mc",
		header: "Market Cap",
		cell: ({ row }) => {
			const t = row.original;
			return (
				<div className="text-xs font-geist-mono xl:text-left">
					${formatPrice(t.metrics.marketcap_usd)}
				</div>
			);
		},
	},
	{
		accessorKey: "volume",
		header: "Volume",
		cell: ({ row }) => {
			const t = row.original;

			return (
				<div className="">
					<span className="text-xs font-geist-mono text-muted-foreground">
						${formatPrice(Number(t.metrics.volume_1d_usd))}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "actions",
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => {
			const t = row.original;

			const handleDelete = async (e: React.MouseEvent) => {
				e.preventDefault();
				e.stopPropagation();

				if (!t.watchlistId) {
					toast.error("Unable to delete: watchlist ID not found");
					return;
				}

				try {
					await removeFromWatchlist(t.watchlistId);
					revalidateTagServer("watchlist");
					toast.success("Removed from watchlist");
				} catch (error) {
					toast.error("Failed to remove token from watchlist");
				}
			};

			return (
				<div className="flex justify-center">
					<Button
						size="icon"
						className="h-6 w-6 bg-transparent hover:bg-destructive/10"
						variant="ghost"
						onClick={handleDelete}
					>
						<Trash2 className="h-3 w-3 text-destructive" />
					</Button>
				</div>
			);
		},
	},
];

export const WatchListTable = () => {
	// Use separate hooks for data and actions
	const { tokens, isLoading, error, isEmpty } = useWatchlistData();
	const { removeFromWatchlist } = useWatchlistActions();

	// Create columns with the remove action
	const columns = React.useMemo(
		() => createTableColumns(removeFromWatchlist),
		[removeFromWatchlist],
	);

	const table = useReactTable({
		data: tokens,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	// Error handling
	if (error) {
		return (
			<div className="text-sm text-destructive py-1 px-1 border-b border-b-border">
				Failed to load watchlist data
			</div>
		);
	}

	// Empty state
	if (isEmpty) {
		return (
			<div className="text-sm text-muted-foreground py-1 px-1 border-b border-b-border">
				No tokens in watchlist
			</div>
		);
	}

	return (
		<div className="flex h-full w-full flex-col mt-4">
			{/* Header */}
			<div
				className={cn(
					"w-full border-b grid sm:min-w-[800px] grid-cols-4 border-b-border mb-[2px]",
				)}
			>
				{table.getHeaderGroups().map((headerGroup) => (
					<div key={headerGroup.id} className="contents">
						{headerGroup.headers.map((header) => (
							<div
								key={header.id}
								className={cn(
									"py-3 px-4 text-xs font-medium text-muted-foreground",
									header.id === "actions" && "text-center",
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
					{isLoading && (
						<div className="flex items-center flex-row gap-4 py-1 px-1 border-b border-b-border">
							{Array.from({ length: 4 }).map((_, i) => (
								<Skeleton key={i} className="h-8 w-28" />
							))}
						</div>
					)}
					<div className={cn("sm:min-w-[800px]")}>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row, index) => (
								<div
									key={row.id}
									className={cn(
										"grid w-full grid-cols-4 border-b items-center",
										index % 2 === 0 ? "bg-muted/50" : "",
									)}
								>
									{row.getVisibleCells().map((cell) => (
										<div
											key={cell.id}
											className={cn(
												"py-3 px-4",
												cell.column.id === "actions" && "flex justify-center",
											)}
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
				</ScrollArea>
			</div>
		</div>
	);
};
