import { HTTP_STATUS } from "@repo/shared-constants/constants.ts";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "@repo/ui/components/ui/sonner";
import { useServerAction } from "zsa-react";
import { revalidateTagServer } from "~/app/actions/revalidate";
import {
  addToWatchlistAction,
  deleteWatchlistAction,
  getUserWatchlist,
} from "~/app/actions/watchlist-actions";
import { ApiResponse } from "~/types";
import { UserWatchlist } from "~/types/wallets";

export function ToggleWatchlist({
  isMobile,
  ca,
}: {
  isMobile: boolean;
  ca: string;
}) {
  const queryClient = useQueryClient();

  const { isPending: isAddPending, execute: executeAdd } =
    useServerAction(addToWatchlistAction);

  const { isPending: isDeletePending, execute: executeDelete } =
    useServerAction(deleteWatchlistAction);

  const {
    data: watchlist,
    // isLoading: isWatchlistLoading,
    // error: watchlistError,
    // isFetching: isWatchlistFetching,
    // isInitialLoading: isWatchlistInitialLoading,
  } = useQuery({
    queryKey: ["watchlist"],
    queryFn: getUserWatchlist,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  // Add null checks for watchlist data
  const watchlistData = watchlist?.data || [];
  const contractAddresses = watchlistData
    .map((item: any) => item.ca)
    .filter(Boolean);
  const watchlistItem = watchlistData.find((item) => item.ca === ca);

  const handleWatchlistToggle = async () => {
    const isRemoving = watchlistItem && watchlistItem.ca === ca;

    const promise = (
      isRemoving
        ? executeDelete({ id: watchlistItem.id as string }).then((data) => {
            const res = data[0];

            if (!res) {
              throw new Error("Error occured when removing from watchlist");
            }

            if (res.status === HTTP_STATUS.UNAUTHORIZED) {
              throw new Error("You are unauthorized to perform this action");
            }
            if (res.status === HTTP_STATUS.NOT_FOUND) {
              throw new Error(
                "You can't delete a watchlist that doesn't exist",
              );
            }
            return res;
          })
        : executeAdd({ ca: ca }).then((data) => {
            const res = data[0];

            if (!res) {
              throw new Error("Error occured when adding to watchlist");
            }

            if (res.status === HTTP_STATUS.UNAUTHORIZED) {
              throw new Error("You are unauthorized to perform this action");
            }
            if (res.status === HTTP_STATUS.CONFLICT) {
              throw new Error("Already in watchlist");
            }
            return res;
          })
    ) as Promise<ApiResponse<UserWatchlist>>;

    toast.promise(promise, {
      loading: isRemoving
        ? "Removing from watchlist..."
        : "Adding to watchlist...",
      success: () => {
        // Invalidate queries and revalidate after successful operation
        setTimeout(async () => {
          await queryClient.invalidateQueries({ queryKey: ["watchlist"] });
          await queryClient.invalidateQueries({
            queryKey: ["batch-tokens"],
            exact: false,
          });
          revalidateTagServer("watchlist");
        }, 0);

        return isRemoving ? "Removed from watchlist" : "Added to watchlist";
      },
      error: (error) => {
        return (
          error.message ||
          (isRemoving
            ? "Failed to remove from watchlist"
            : "Failed to add to watchlist")
        );
      },
    });
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
      disabled={isAddPending || isDeletePending}
    >
      <Star
        className={cn(
          "h-5 w-5",
          contractAddresses?.includes(ca) && " text-blue-500",
        )}
      />
    </Button>
  );
}
