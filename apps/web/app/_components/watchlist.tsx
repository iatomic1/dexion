"use client";
import type { TokenMetadata } from "@repo/token-watcher/token.ts";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { formatPrice } from "~/lib/helpers/numbers";
import {
  deleteWatchlistAction,
  getUserWatchlist,
} from "../_actions/watchlist-actions";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { getBatchTokenData } from "~/lib/queries/token-watcher";
import Link from "next/link";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";
import { HTTP_STATUS } from "~/lib/constants";
import { revalidateTagServer } from "../_actions/revalidate";
import { Trash2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@repo/ui/components/ui/scroll-area";

export const WatchLists = () => {
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

  const contractAddresses = watchlist?.data
    ?.map((item: any) => item.ca)
    .filter(Boolean);

  const {
    data: tokens = [],
    isLoading: isTokensLoading,
    error: tokensError,
    isFetching: isTokensFetching,
    isInitialLoading: isTokensInitialLoading,
  } = useQuery({
    queryKey: ["batch-tokens", contractAddresses],
    refetchOnWindowFocus: true,
    queryFn: () => getBatchTokenData(contractAddresses),
    enabled: contractAddresses?.length > 0, // Only run if we have contract addresses
    staleTime: 60 * 1000, // 30 seconds - tokens change frequently
    placeholderData: keepPreviousData,
  });

  // Create a map of contract addresses to watchlist IDs for quick lookup
  const watchlistMap = new Map(
    watchlist?.data?.map((item: any) => [item.ca, item.id]) || [],
  );

  // Merge token data with watchlist IDs
  const tokensWithWatchlistIds = tokens?.map((token: TokenMetadata) => ({
    ...token,
    watchlistId: watchlistMap.get(token.contract_id),
  }));

  // Only show skeleton on initial loading, not on refetch/mutations
  const isLoading = isWatchlistInitialLoading || isTokensInitialLoading;

  if (isLoading) {
    return (
      <div className="flex items-center flex-row gap-4 py-1 px-1 border-b border-b-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28" />
        ))}
      </div>
    );
  }

  // Error handling
  if (watchlistError || tokensError) {
    return (
      <div className="text-sm text-destructive py-1 px-1 border-b border-b-border">
        Failed to load watchlist data
      </div>
    );
  }

  // Empty state
  if (watchlist?.data?.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-1 px-1 border-b border-b-border">
        No tokens in watchlist
      </div>
    );
  }

  return (
    <ScrollArea className="">
      <div className="flex items-center flex-row gap-2 py-1 px-1 border-b border-b-border">
        {tokensWithWatchlistIds &&
          tokensWithWatchlistIds?.map(
            (token: TokenMetadata & { watchlistId?: string }) => (
              <WatchListItem
                key={token.contract_id || token.symbol}
                token={token}
                watchlistId={token?.watchlistId as string}
                isRefetching={isTokensFetching}
              />
            ),
          )}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

const WatchListItem = ({
  token,
  isRefetching,
  watchlistId,
}: {
  token: TokenMetadata;
  isRefetching?: boolean;
  watchlistId: string;
}) => {
  const queryClient = useQueryClient();

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
        // toast.success("Token removed from watchlist");
      },
      onError: () => {
        toast.error("Failed to remove token from watchlist");
      },
    });

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the Link from navigating
    e.stopPropagation(); // Prevent event bubbling

    if (!watchlistId) {
      toast.error("Unable to delete: watchlist ID not found");
      return;
    }

    await executeDelete({ id: watchlistId });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <Link href={`/meme/${token.contract_id}`}>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 transition-opacity pr-8 ${isRefetching ? "opacity-70" : ""}`}
            >
              <Avatar className="h-4 w-4">
                <AvatarImage
                  src={token.image_url || "/placeholder.svg"}
                  alt={token.symbol}
                />
                <AvatarFallback className="text-xs">
                  {token.symbol.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="uppercase text-xs font-medium">
                {token.symbol}
              </span>
              <span className="text-xs text-muted-foreground">
                ${formatPrice(token.metrics.marketcap_usd)}
              </span>
            </Button>
          </Link>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 bg-transparent hover:bg-destructive/10"
                variant="ghost"
                onClick={handleDelete}
                disabled={isDeletePending}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span className="text-[11px]">Remove from watchlist</span>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipTrigger>
    </Tooltip>
  );
};
