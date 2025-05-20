"use client";
import { createContext, useContext, useEffect, useState } from "react";
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
};

// Define the TokenDataContextType with all the properties
export type TokenDataContextType = {
  tx: TxPayload | null;
  tokenData: TokenMetadata | null;
  tradesData: TokenSwapTransaction[];
  holdersData: TokenHolder[];
  poolsData: LiquidityPool[];
  isLoadingMetadata: boolean;
  isLoadingTrades: boolean;
  isLoadingHolders: boolean;
  isLoadingPools: boolean;
};

// Create the contexts with proper default values
const TokenSocketContext = createContext<TxPayload | null>(null);
const TokenDataContext = createContext<TokenDataContextType>({
  tx: null,
  tokenData: null,
  tradesData: [],
  holdersData: [],
  poolsData: [],
  isLoadingMetadata: true,
  isLoadingTrades: true,
  isLoadingHolders: true,
  isLoadingPools: true,
});

// Hook to access the original socket data
export const useTokenSocket = () => useContext(TokenSocketContext);

// Hook to access the processed token data
export const useTokenData = () => useContext(TokenDataContext);

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
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [isLoadingTrades, setIsLoadingTrades] = useState(true);
  const [isLoadingHolders, setIsLoadingHolders] = useState(true);
  const [isLoadingPools, setIsLoadingPools] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const match = pathname?.match(/\/meme\/(.+)/);
    const ca = match?.[1];
    if (!ca) return;

    // Reset states when contract address changes
    setIsLoadingMetadata(true);
    setIsLoadingTrades(true);
    setIsLoadingHolders(true);
    setIsLoadingPools(true);

    const socket = getSocket();
    socket.emit("subscribe", ca);

    socket.on("tx", (data: TxPayload) => {
      if (data.contract === ca) {
        setTx(data);
        if (data.type === "metadata") {
          setTokenData(data.tokenMetadata);
          setIsLoadingMetadata(false);
        } else if (data.type === "trades") {
          setTradesData(data.trades);
          setIsLoadingTrades(false);
        } else if (data.type === "holders") {
          setHoldersData(data.holders);
          setIsLoadingHolders(false);
        } else if (data.type === "pools") {
          setPoolsData(data.pools);
          setIsLoadingPools(false);
        }
      }
    });

    return () => {
      socket.emit("unsubscribe", ca);
      socket.off("tx");
    };
  }, [pathname]);

  const contextValue: TokenDataContextType = {
    tx,
    tokenData,
    tradesData,
    holdersData,
    poolsData,
    isLoadingMetadata,
    isLoadingTrades,
    isLoadingHolders,
    isLoadingPools,
  };

  return (
    <TokenSocketContext.Provider value={tx}>
      <TokenDataContext.Provider value={contextValue}>
        {children}
      </TokenDataContext.Provider>
    </TokenSocketContext.Provider>
  );
};
