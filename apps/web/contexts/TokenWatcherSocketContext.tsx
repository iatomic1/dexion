"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import { getSocket } from "~/lib/token-socket";
import {
  LiquidityPool,
  TokenHolder,
  TokenMetadata,
  TokenSwapTransaction,
} from "@repo/token-watcher/token.ts";

// Original TxPayload type for socket data
type TxPayload = {
  type: string;
  contract: string;
  txId: string;
  tokenMetadata: TokenMetadata;
  trades: TokenSwapTransaction[];
  holders: TokenHolder[];
  pools: LiquidityPool[];
  devTokens: TokenMetadata[];
};

// Split contexts by data domain
const MetadataContext = createContext<{
  data: TokenMetadata | null;
  isLoading: boolean;
}>({
  data: null,
  isLoading: true,
});

const TradesContext = createContext<{
  data: TokenSwapTransaction[];
  isLoading: boolean;
}>({
  data: [],
  isLoading: true,
});

const HoldersContext = createContext<{
  data: TokenHolder[];
  isLoading: boolean;
}>({
  data: [],
  isLoading: true,
});

const PoolsContext = createContext<{
  data: LiquidityPool[];
  isLoading: boolean;
}>({
  data: [],
  isLoading: true,
});

const DevTokensContext = createContext<{
  data: TokenMetadata[];
  isLoading: boolean;
}>({
  data: [],
  isLoading: true,
});

// Raw socket context (kept for compatibility)
const TokenSocketContext = createContext<TxPayload | null>(null);

// Custom hooks for accessing specific data
export const useTokenMetadata = () => useContext(MetadataContext);
export const useTokenTrades = () => useContext(TradesContext);
export const useTokenHolders = () => useContext(HoldersContext);
export const useTokenPools = () => useContext(PoolsContext);
export const useDevTokens = () => useContext(DevTokensContext);
export const useTokenSocket = () => useContext(TokenSocketContext);

// Backwards compatibility hook that combines all data
export const useTokenData = () => {
  const { data: tokenData, isLoading: isLoadingMetadata } = useTokenMetadata();
  const { data: tradesData, isLoading: isLoadingTrades } = useTokenTrades();
  const { data: holdersData, isLoading: isLoadingHolders } = useTokenHolders();
  const { data: poolsData, isLoading: isLoadingPools } = useTokenPools();
  const { data: devTokensData, isLoading: isDevTokensLoading } = useDevTokens();

  const tx = useTokenSocket();

  return {
    tx,
    tokenData,
    tradesData,
    holdersData,
    poolsData,
    isLoadingMetadata,
    isLoadingTrades,
    isLoadingHolders,
    isLoadingPools,
    devTokensData,
    isDevTokensLoading,
  };
};

export const TokenSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [tx, setTx] = useState<TxPayload | null>(null);
  const [tokenData, setTokenData] = useState<TokenMetadata | null>(null);
  const [tradesData, setTradesData] = useState<TokenSwapTransaction[]>([]);
  const [holdersData, setHoldersData] = useState<TokenHolder[]>([]);
  const [poolsData, setPoolsData] = useState<LiquidityPool[]>([]);
  const [devTokensData, setDevTokensData] = useState<TokenMetadata[]>([]);
  const [isDevTokensLoading, setIsDevTokensLoading] = useState(true);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [isLoadingTrades, setIsLoadingTrades] = useState(true);
  const [isLoadingHolders, setIsLoadingHolders] = useState(true);
  const [isLoadingPools, setIsLoadingPools] = useState(true);

  const pathname = usePathname();

  const handleSocketEvent = useCallback((data: TxPayload, ca: string) => {
    if (data.contract !== ca) return;

    setTx(data);

    switch (data.type) {
      case "metadata":
        setTokenData(data.tokenMetadata);
        setIsLoadingMetadata(false);
        break;
      case "trades":
        console.log("trades emitted", data);
        setTradesData(data.trades);
        setIsLoadingTrades(false);
        break;
      case "holders":
        setHoldersData(data.holders);
        setIsLoadingHolders(false);
        break;
      case "pools":
        setPoolsData(data.pools);
        setIsLoadingPools(false);
        break;
      case "devTokens":
        setDevTokensData(data.devTokens);
        console.log("fuck yhhhh", data.devTokens);
        setIsDevTokensLoading(false);
    }
  }, []);

  useEffect(() => {
    const match = pathname?.match(/\/meme\/(.+)/);
    const ca = match?.[1];
    if (!ca) return;

    // Reset states when contract address changes
    setIsLoadingMetadata(true);
    setIsLoadingTrades(true);
    setIsLoadingHolders(true);
    setIsDevTokensLoading(true);
    setIsLoadingPools(true);

    const socket = getSocket();
    socket.emit("subscribe", ca);

    socket.on("tx", (data: TxPayload) => handleSocketEvent(data, ca));

    return () => {
      socket.emit("unsubscribe", ca);
      socket.off("tx");
    };
  }, [pathname, handleSocketEvent]);

  // Memoize context values to prevent unnecessary rerenders
  const metadataValue = useMemo(
    () => ({
      data: tokenData,
      isLoading: isLoadingMetadata,
    }),
    [tokenData, isLoadingMetadata],
  );

  const tradesValue = useMemo(
    () => ({
      data: tradesData,
      isLoading: isLoadingTrades,
    }),
    [tradesData, isLoadingTrades],
  );

  const holdersValue = useMemo(
    () => ({
      data: holdersData,
      isLoading: isLoadingHolders,
    }),
    [holdersData, isLoadingHolders],
  );

  const poolsValue = useMemo(
    () => ({
      data: poolsData,
      isLoading: isLoadingPools,
    }),
    [poolsData, isLoadingPools],
  );

  const devTokensValue = useMemo(
    () => ({
      data: devTokensData,
      isLoading: isDevTokensLoading,
    }),
    [devTokensData, isDevTokensLoading],
  );

  return (
    <TokenSocketContext.Provider value={tx}>
      <MetadataContext.Provider value={metadataValue}>
        <TradesContext.Provider value={tradesValue}>
          <HoldersContext.Provider value={holdersValue}>
            <PoolsContext.Provider value={poolsValue}>
              <DevTokensContext value={devTokensValue}>
                {children}
              </DevTokensContext>
            </PoolsContext.Provider>
          </HoldersContext.Provider>
        </TradesContext.Provider>
      </MetadataContext.Provider>
    </TokenSocketContext.Provider>
  );
};
