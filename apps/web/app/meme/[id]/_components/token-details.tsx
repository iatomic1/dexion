"use client";

import { useEffect, useState } from "react";
import TokenChart from "./token-chart";
import TokenInfo from "./token-info";
import TokenTabs from "./token-tabs";
import TradingPanel from "./trading/trading-panel";

// Mock data for the token
const mockTokenData = {
  id: "lilcoin",
  name: "lilcoin",
  symbol: "LIL COIN",
  price: 3.76,
  priceChange: -0.25,
  liquidity: "$8.06K",
  supply: "18",
  marketCap: "$67.68K",
  volume: "0.55",
  burnRate: "0.35%",
};

export default function TokenDetailPage({ tokenId }: { tokenId: string }) {
  const [tokenData, setTokenData] = useState(mockTokenData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch the token data based on the tokenId
    // For now, we'll just simulate a loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [tokenId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 flex-col">
        <TokenInfo token={tokenData} />
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <TokenChart tokenSymbol={tokenData.symbol} />
          </div>
          <div className="border-l lg:col-span-1">
            <TradingPanel token={tokenData} />
          </div>
        </div>
        <TokenTabs />
      </main>
    </div>
  );
}
