import { TokenMetadata } from "@repo/tokens/types";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { searchTokens, getTransactions } from "~/lib/queries/hiro";
import { getTokenMetadata } from "~/lib/queries/stxtools";
import { AddressTransactionsV2ListResponse } from "~/types/hiro/transactions";

export type SimilarToken = {
  token: TokenMetadata;
  lastTx: string;
};

type UseSimilarTokensResult = {
  similarTokens: SimilarToken[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

export const useSimilarTokens = (
  token: TokenMetadata,
): UseSimilarTokensResult => {
  // 1. Search for tokens based on name/symbol
  const tokenSearchQuery = useQuery({
    queryKey: ["tokenSearch", token.symbol],
    queryFn: () => searchTokens(token.symbol),
    enabled: !!token.symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const topTokens = tokenSearchQuery.data?.results?.slice(0, 3) || [];
  const contractPrincipals = topTokens.map((t) => t.contract_principal);

  // 2. Get transactions for each token (in parallel)
  const transactionQueries = useQueries({
    queries: contractPrincipals.map((principal) => ({
      queryKey: ["transactions", principal],
      queryFn: () => getTransactions(principal),
      enabled: !!principal,
      staleTime: 30 * 1000, // 30 seconds
    })),
    combine: (results) => {
      return {
        data: results.map(
          (result) =>
            result.data as AddressTransactionsV2ListResponse | undefined,
        ),
        isLoading: results.some((result) => result.isLoading),
        isError: results.some((result) => result.isError),
        error: results.find((result) => result.error)?.error || null,
      };
    },
  });

  // 3. Get token metadata for each token (in parallel)
  const metadataQueries = useQueries({
    queries: contractPrincipals.map((principal) => ({
      queryKey: ["tokenMetadata", principal],
      queryFn: () => getTokenMetadata(principal),
      enabled: !!principal,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
    combine: (results) => {
      return {
        data: results.map(
          (result) => result.data as TokenMetadata | null | undefined,
        ),
        isLoading: results.some((result) => result.isLoading),
        isError: results.some((result) => result.isError),
        error: results.find((result) => result.error)?.error || null,
      };
    },
  });

  // Determine overall loading and error states
  const isLoading =
    tokenSearchQuery.isLoading ||
    transactionQueries.isLoading ||
    metadataQueries.isLoading;

  const isError =
    tokenSearchQuery.isError ||
    transactionQueries.isError ||
    metadataQueries.isError;

  const error =
    tokenSearchQuery.error ||
    transactionQueries.error ||
    metadataQueries.error ||
    null;

  const similarTokens: SimilarToken[] = [];

  if (
    topTokens.length > 0 &&
    transactionQueries.data?.length === topTokens.length &&
    metadataQueries.data?.length === topTokens.length
  ) {
    for (let i = 0; i < topTokens.length; i++) {
      const metadata = metadataQueries.data[i];
      const txData = transactionQueries.data[i];

      if (metadata && txData && txData.results && txData.results.length > 0) {
        const lastTxDate = txData.results[0]?.tx?.block_time_iso || "";
        similarTokens.push({
          token: metadata,
          lastTx: lastTxDate,
        });
      }
    }
  }
  useEffect(() => {
    console.log(similarTokens, "Ssssssss");
  }, [similarTokens]);

  return {
    similarTokens,
    isLoading,
    isError,
    error,
  };
};
