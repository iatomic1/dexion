"use client";
import Link from "next/link";
import { toast } from "@repo/ui/components/ui/sonner";
import { useServerAction } from "zsa-react";
import { Trash2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@repo/ui/components/ui/scroll-area";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@repo/ui/components/ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";
import {
  useWatchlistData,
  TokenWithWatchlistId,
} from "~/hooks/useWatchlistData";
import { formatPrice } from "~/lib/helpers/numbers";
import { revalidateTagServer } from "~/app/actions/revalidate";
import { deleteWatchlistAction } from "~/app/actions/watchlist-actions";
import { HTTP_STATUS } from "@repo/shared-constants/constants.ts";

export const WatchListBanner = () => {
  const { tokens, isInitialLoading, hasError, isEmpty, isFetching } =
    useWatchlistData();

  // Show skeleton on initial loading
  if (isInitialLoading) {
    return (
      <div className="flex items-center flex-row gap-4 py-1 px-1 border-b border-b-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28" />
        ))}
      </div>
    );
  }

  // Error handling
  if (hasError) {
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
    <ScrollArea className="hidden sm:flex">
      <div className="flex items-center flex-row gap-2 py-1 px-1 border-b border-b-border">
        {tokens.map((token) => (
          <WatchListItem
            key={token.contract_id || token.symbol || token.watchlistId}
            token={token}
            watchlistId={token.watchlistId as string}
            isRefetching={isFetching}
          />
        ))}
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
  token: TokenWithWatchlistId;
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
      },
      onError: () => {
        toast.error("Failed to remove token from watchlist");
      },
    });

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!watchlistId) {
      toast.error("Unable to delete: watchlist ID not found");
      return;
    }

    await executeDelete({ id: watchlistId });
  };

  // Safe access to token properties
  const contractId = token?.contract_id;
  const symbol = token?.symbol;
  const imageUrl = token?.image_url;
  const marketcap = token?.metrics?.marketcap_usd || 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <Link href={`/meme/${contractId}`}>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 transition-opacity pr-8 ${isRefetching ? "opacity-70" : ""}`}
            >
              <Avatar className="h-4 w-4">
                <AvatarImage
                  src={imageUrl || "/placeholder.svg"}
                  alt={symbol || "Token"}
                />
                <AvatarFallback className="text-xs">
                  {symbol?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="uppercase text-xs font-medium">
                {symbol || "Unknown"}
              </span>
              <span className="text-xs text-muted-foreground">
                ${formatPrice(marketcap)}
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
