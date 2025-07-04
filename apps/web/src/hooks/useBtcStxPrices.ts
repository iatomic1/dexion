import { TOKEN_WATCHER_API_BASE_URL } from "@repo/shared-constants/constants.ts";
import { useQuery } from "@tanstack/react-query";
import type { CryptoAsset } from "~/types/xverse";

const fetchBtcAndStxPrices = async (): Promise<CryptoAsset[]> => {
  const res = await fetch(`${TOKEN_WATCHER_API_BASE_URL}market/btcstx`);

  if (!res.ok) {
    throw new Error("Error fetching stx and btc prices");
  }

  return res.json();
};

export const usePrices = () => {
  return useQuery({
    queryKey: ["btc-stx-prices"],
    queryFn: fetchBtcAndStxPrices,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
