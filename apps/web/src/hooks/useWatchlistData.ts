"use client";
import type { TokenMetadata } from "@repo/tokens/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getUserWatchlist } from "~/app/actions/watchlist-actions";
import { getBatchTokenData } from "~/lib/queries/token-watcher";
import type { UserWatchlist } from "~/types/wallets";

export interface TokenWithWatchlistId extends TokenMetadata {
  watchlistId?: string;
}

export const useWatchlistData = () => {
  // Fetch watchlist data
  const {
    data: watchlist,
    isLoading: isWatchlistLoading,
    error: watchlistError,
    isFetching: isWatchlistFetching,
    isInitialLoading: isWatchlistInitialLoading,
  } = useQuery({
    queryKey: ["watchlist"],
    queryFn: getUserWatchlist,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  });

  // Memoize contract addresses to prevent unnecessary re-renders
  const contractAddresses = useMemo(() => {
    // Add null check here
    if (!watchlist?.data || !Array.isArray(watchlist.data)) {
      return [];
    }
    return watchlist.data.map((item: UserWatchlist) => item.ca).filter(Boolean);
  }, [watchlist?.data]);

  // Fetch token data for all contract addresses
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
    enabled: contractAddresses.length > 0,
    staleTime: 60 * 1000, // 1 minute
    placeholderData: keepPreviousData,
  });

  // Memoize the watchlist map and merged data
  const { watchlistMap, tokensWithWatchlistIds } = useMemo(() => {
    // Add null check for watchlist data
    const watchlistData = watchlist?.data;
    if (!watchlistData || !Array.isArray(watchlistData)) {
      return {
        watchlistMap: new Map(),
        tokensWithWatchlistIds:
          tokens?.map((token: TokenMetadata) => ({
            ...token,
            watchlistId: undefined,
          })) || [],
      };
    }

    // Create a map of contract addresses to watchlist IDs for quick lookup
    const map = new Map(
      watchlistData.map((item: UserWatchlist) => [item.ca, item.id]),
    );

    // Merge token data with watchlist IDs
    const mergedTokens: TokenWithWatchlistId[] =
      tokens?.map((token: TokenMetadata) => ({
        ...token,
        watchlistId: map.get(token.contract_id),
      })) || [];

    return {
      watchlistMap: map,
      tokensWithWatchlistIds: mergedTokens,
    };
  }, [watchlist?.data, tokens]);

  // Determine loading states
  const isInitialLoading = isWatchlistInitialLoading || isTokensInitialLoading;
  const isFetching = isWatchlistFetching || isTokensFetching;
  const hasError = watchlistError || tokensError;
  const isEmpty = !watchlist?.data?.length;

  return {
    // Data
    watchlist: watchlist?.data || [],
    tokens: tokensWithWatchlistIds,
    // Loading states
    isInitialLoading,
    isFetching,
    isWatchlistLoading,
    isTokensLoading,
    // Error states
    hasError,
    watchlistError,
    tokensError,
    // Computed states
    isEmpty,
    contractAddresses,
  };
};
