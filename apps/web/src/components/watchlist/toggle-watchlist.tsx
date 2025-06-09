import { HTTP_STATUS } from "@repo/shared-constants/constants.ts";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";
import { revalidateTagServer } from "~/app/actions/revalidate";
import {
  addToWatchlistAction,
  deleteWatchlistAction,
  getUserWatchlist,
} from "~/app/actions/watchlist-actions";

export function ToggleWatchlist({
  isMobile,
  ca,
}: {
  isMobile: boolean;
  ca: string;
}) {
  const queryClient = useQueryClient();
  const { isPending: isAddPending, execute: executeAdd } = useServerAction(
    addToWatchlistAction,
    {
      onSuccess: async ({ data: res }) => {
        if (res.status === HTTP_STATUS.UNAUTHORIZED) {
          toast.error("You are unauthorized to perform this action");
          return;
        }
        if (res.status === HTTP_STATUS.CONFLICT) {
          toast.error("Already in watchlist");
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ["watchlist"] });
        await queryClient.invalidateQueries({
          queryKey: ["batch-tokens"],
          exact: false,
        });
        revalidateTagServer("watchlist");
        toast.success("Added to watchlist");
      },
      onError: () => {
        toast.error("Failed to remove token from watchlist");
      },
    },
  );
  const { isPending: isDeletePending, execute: executeDelete } =
    useServerAction(deleteWatchlistAction, {
      onSuccess: async ({ data: res }) => {
        if (res.status === HTTP_STATUS.NOT_FOUND) {
          toast.error("You can't delete a watchlist that doesn't exist");
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ["watchlist"] });
        await queryClient.invalidateQueries({
          queryKey: ["batch-tokens"],
          exact: false,
        });
        revalidateTagServer("watchlist");
      },
      onError: () => {
        toast.error("Failed to remove token from watchlist");
      },
    });
  const {
    data: watchlist,
    isLoading: isWatchlistLoading,
    error: watchlistError,
    isFetching: isWatchlistFetching,
    isInitialLoading: isWatchlistInitialLoading,
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

  return (
    <Button
      variant={isMobile ? "secondary" : "ghost"}
      size={"icon"}
      className={cn(
        "hover:text-indigo-500 transition-colors duration-150 ease-in-out",
        isMobile && "rounded-full",
      )}
      onClick={async () => {
        console.log(contractAddresses);
        if (watchlistItem && watchlistItem.ca === ca) {
          console.log("using delete");
          await executeDelete({
            id: watchlistItem.id as string,
          });
        } else {
          await executeAdd({ ca: ca });
          console.log("using add");
        }
      }}
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
