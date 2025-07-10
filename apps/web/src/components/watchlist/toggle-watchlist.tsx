import { Button } from "@repo/ui/components/ui/button";
import { toast } from "@repo/ui/components/ui/sonner";
import { cn } from "@repo/ui/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";
import { revalidateTagServer } from "~/app/actions/revalidate";
import {
	useWatchlistActions,
	useWatchlistData,
} from "~/contexts/WatchlistContext";

export function ToggleWatchlist({
	isMobile,
	ca,
}: {
	isMobile: boolean;
	ca: string;
}) {
	const [isProcessing, setIsProcessing] = useState(false);

	// Use separate hooks for data and actions to minimize re-renders
	const { watchlist } = useWatchlistData();
	const { addToWatchlist, removeFromWatchlist } = useWatchlistActions();

	// Check if this token is in the watchlist
	const watchlistItem = watchlist.find((item) => item.ca === ca);
	const isInWatchlist = Boolean(watchlistItem);

	const handleWatchlistToggle = async () => {
		if (isProcessing) return;

		setIsProcessing(true);

		try {
			if (isInWatchlist) {
				// Remove from watchlist
				if (!watchlistItem?.id) {
					toast.error("Watchlist ID not found");
					setIsProcessing(false);
					return;
				}

				toast.promise(removeFromWatchlist(watchlistItem.id), {
					loading: "Removing from watchlist...",
					success: () => {
						revalidateTagServer("watchlist");
						return "Removed from watchlist";
					},
					error: "Failed to remove from watchlist",
				});
			} else {
				// Add to watchlist
				toast.promise(addToWatchlist(ca), {
					loading: "Adding to watchlist...",
					success: () => {
						revalidateTagServer("watchlist");
						return "Added to watchlist";
					},
					error: (err) => {
						// Handle specific error cases
						if (
							err?.message?.includes("conflict") ||
							err?.message?.includes("already")
						) {
							return "Already in watchlist";
						}
						return "Failed to add to watchlist";
					},
				});
			}
		} catch (error) {
			toast.error(
				isInWatchlist
					? "Failed to remove from watchlist"
					: "Failed to add to watchlist",
			);
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<Button
			variant={isMobile ? "secondary" : "ghost"}
			size={"icon"}
			className={cn(
				"hover:text-indigo-500 transition-colors duration-150 ease-in-out",
				isMobile && "rounded-full",
			)}
			onClick={handleWatchlistToggle}
			disabled={isProcessing}
		>
			<Star className={cn("h-5 w-5", isInWatchlist && "text-blue-500")} />
		</Button>
	);
}
