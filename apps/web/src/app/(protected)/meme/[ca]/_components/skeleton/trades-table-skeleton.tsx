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

// Helper function to define consistent column widths (same as original)
function getColumnWidth(columnId: string): string {
	switch (columnId) {
		case "timestamp":
			return "120px";
		case "type":
			return "100px";
		case "mc":
			return "120px";
		case "amount":
			return "120px";
		case "totalUsd":
			return "120px";
		case "trader":
			return "200px";
		default:
			return "auto";
	}
}

export default function TradesTableSkeleton() {
	const isMobile = useMediaQuery("(max-width: 768px)");

	// Column headers
	const columns = [
		{ id: "timestamp", label: "Age / Time" },
		{ id: "type", label: "Type" },
		{ id: "mc", label: "MC" },
		{ id: "amount", label: "Amount" },
		{ id: "totalUsd", label: "Total USD" },
		{ id: "trader", label: "Trader" },
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
							column.id === "amount" || column.id === "totalUsd"
								? "text-right"
								: column.id === "trader"
									? "text-right"
									: "text-left",
						)}
						style={{
							width: getColumnWidth(column.id),
						}}
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
								{/* Timestamp */}
								<div
									className="py-3 px-4 text-left"
									style={{ width: getColumnWidth("timestamp") }}
								>
									<Skeleton className="h-4 w-20" />
								</div>

								{/* Type */}
								<div
									className="py-3 px-4 text-left"
									style={{ width: getColumnWidth("type") }}
								>
									<Skeleton className="h-4 w-10" />
								</div>

								{/* MC */}
								<div
									className="py-3 px-4 text-left"
									style={{ width: getColumnWidth("mc") }}
								>
									<Skeleton className="h-4 w-16" />
								</div>

								{/* Amount */}
								<div
									className="py-3 px-4 text-right"
									style={{ width: getColumnWidth("amount") }}
								>
									<Skeleton className="h-4 w-16 ml-auto" />
								</div>

								{/* Total USD */}
								<div
									className="py-3 px-4 text-right"
									style={{ width: getColumnWidth("totalUsd") }}
								>
									<Skeleton className="h-4 w-20 ml-auto" />
								</div>

								{/* Trader */}
								<div
									className="py-3 px-4 text-right"
									style={{ width: getColumnWidth("trader") }}
								>
									<div className="flex items-center gap-2 justify-end">
										<Skeleton className="h-3 w-3 rounded-full" />
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-3 w-3 rounded-full" />
										<Skeleton className="h-3 w-3 rounded-full" />
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
