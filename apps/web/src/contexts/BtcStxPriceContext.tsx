"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { usePrices } from "~/hooks/useBtcStxPrices";
import type { CryptoAsset } from "~/types/xverse";

interface PriceContextType {
  prices: CryptoAsset[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

interface PriceProviderProps {
  children: ReactNode;
}

export const BtcStxPriceProvider: React.FC<PriceProviderProps> = ({
  children,
}) => {
  const { data: prices, isLoading, isError, error, refetch } = usePrices();

  const value = {
    prices,
    isLoading,
    isError,
    error,
    refetch,
  };

  return (
    <PriceContext.Provider value={value}>{children}</PriceContext.Provider>
  );
};

export const useBtcStxPriceContext = () => {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error("usePriceContext must be used within a PriceProvider");
  }
  return context;
};
