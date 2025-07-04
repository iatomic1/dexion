"use client";

import { Progress } from "@repo/ui/components/ui/progress";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useEffect, useState } from "react";

// Reuse the media query hook from the original component
export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);
		if (media.matches !== matches) {
			setMatches(media.matches);
		}

		const listener = () => setMatches(media.matches);
		media.addEventListener("change", listener);
		return () => media.removeEventListener("change", listener);
	}, [matches, query]);

	return matches;
}

export default function HoldersTableSkeleton() {
	const isMobile = useMediaQuery("(max-width: 768px)");

	// Column headers
	const columns = [
		{ id: "indexAndWallet", label: "Wallet" },
		{ id: "balance", label: "STX Balance" },
		{ id: "bought", label: "Bought" },
		{ id: "sold", label: "Sold" },
		{ id: "pnl", label: "PnL" },
		{ id: "remaining", label: "Remaining" },
	];

	// Generate rows for the skeleton
	const skeletonRows = Array(10).fill(0);

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
				{columns.map((column) => (
					<div
						key={column.id}
						className={cn(
							"py-3 px-4 text-xs font-medium text-muted-foreground",
							column.id === "remaining" && "text-right",
						)}
					>
						{column.label}
					</div>
				))}
			</div>

			{/* Body */}
			<div className="relative flex-1 overflow-hidden">
				<ScrollArea className="h-full w-full">
					<div className={cn(isMobile ? "min-w-[800px]" : "")}>
						{skeletonRows.map((_, index) => (
							// biome-ignore lint: suspicious/noArrayIndexKey
							<div
								key={`skeleton${index}`}
								className={cn(
									"grid w-full grid-cols-6 border-b items-center",
									index % 2 === 0 ? "bg-muted/50" : "",
								)}
							>
								{/* Wallet */}
								<div className="py-3 px-4">
									<div className="flex items-center gap-2 text-left">
										{/* Index */}
										<div className="w-6 text-xs font-geist-mono text-muted-foreground">
											{index + 1}
										</div>
										<div className="flex items-center gap-1">
											<Skeleton className="h-3 w-3 rounded-full" />
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-3 w-3 rounded-full" />
										</div>
									</div>
								</div>

								{/* STX Balance */}
								<div className="py-3 px-4">
									<Skeleton className="h-4 w-16 xl:ml-0 ml-auto" />
								</div>

								{/* Bought */}
								<div className="py-3 px-4">
									<div className="flex flex-col">
										<Skeleton className="h-4 w-20 mb-1" />
										<Skeleton className="h-3 w-24" />
									</div>
								</div>

								{/* Sold */}
								<div className="py-3 px-4">
									<div className="flex flex-col">
										<Skeleton className="h-4 w-20 mb-1" />
										<Skeleton className="h-3 w-24" />
									</div>
								</div>

								{/* PnL */}
								<div className="py-3 px-4">
									<Skeleton className="h-4 w-16" />
								</div>

								{/* Remaining */}
								<div className="py-3 px-4">
									<div className="text-xs font-geist-mono text-right flex flex-col gap-1">
										<div className="flex items-center gap-1 justify-end">
											<Skeleton className="h-4 w-16" />
											<Skeleton className="h-4 w-12 rounded-sm" />
										</div>
										<Progress value={0} className="h-1 max-w-20 self-end" />
									</div>
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
