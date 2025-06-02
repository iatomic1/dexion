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
  TooltipTrigger,
  TooltipContent,
} from "@repo/ui/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { formatPrice, formatTinyDecimal } from "~/lib/helpers/numbers";
import { getUserWatchlist } from "../_actions/watchlist-actions";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { getBatchTokenData } from "~/lib/queries/token-watcher";

export const WatchLists = () => {
  const {
    data: watchlist,
    isLoading: isWatchlistLoading,
    error: watchlistError,
  } = useQuery({
    queryKey: ["watchlist"],
    queryFn: getUserWatchlist,
    refetchOnWindowFocus: true,
  });

  const contractAddresses = watchlist?.data
    ?.map((item: any) => item.ca)
    .filter(Boolean);

  const {
    data: tokens = [],
    isLoading: isTokensLoading,
    error: tokensError,
    isFetching: isTokensFetching,
  } = useQuery({
    queryKey: ["batch-tokens", contractAddresses],
    queryFn: () => getBatchTokenData(contractAddresses),
    enabled: contractAddresses?.length > 0, // Only run if we have contract addresses
    staleTime: 30 * 1000, // 30 seconds - tokens change frequently
  });

  // Loading state for either query
  if (isWatchlistLoading || isTokensLoading) {
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
    <div className="flex items-center flex-row gap-2 py-1 px-1 border-b border-b-border">
      {tokens &&
        tokens?.map((token: TokenMetadata) => (
          <WatchListItem
            key={token.contract_id || token.symbol}
            token={token}
            isRefetching={isTokensFetching}
          />
        ))}
    </div>
  );
};

const WatchListItem = ({
  token,
  isRefetching,
}: {
  token: TokenMetadata;
  isRefetching?: boolean;
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1 transition-opacity ${isRefetching ? "opacity-70" : ""}`}
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
          <span className="uppercase text-xs font-medium">{token.symbol}</span>
          <span className="text-xs text-muted-foreground">
            ${formatPrice(token.metrics.marketcap_usd)}
          </span>
        </Button>
      </TooltipTrigger>
      {/* <TooltipContent> */}
      {/*   <div className="text-sm"> */}
      {/*     <div className="font-medium">{token.name || token.symbol}</div> */}
      {/*     <div className="text-muted-foreground"> */}
      {/*       Market Cap: ${formatPrice(token.metrics.marketcap_usd)} */}
      {/*     </div> */}
      {/**/}
      {/*     {token.metrics.price_usd && ( */}
      {/*       <span */}
      {/*         className="text-sm" */}
      {/*         dangerouslySetInnerHTML={{ */}
      {/*           __html: formatTinyDecimal(token.metrics.price_usd), */}
      {/*         }} */}
      {/*       /> */}
      {/*     )} */}
      {/*   </div> */}
      {/* </TooltipContent> */}
    </Tooltip>
  );
};
