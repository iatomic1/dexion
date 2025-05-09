"use client";
import { useEffect, useState } from "react";
import TokenChart from "./token-chart";
import TokenInfo from "./token-info";
import TokenTabs from "./token-tabs";
import TradingPanel from "./trading/trading-panel";
import { useTokenSocket } from "~/contexts/TokenWatcherSocketContext";

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

  const tx = useTokenSocket();

  useEffect(() => {
    if (tx?.contract === tokenId) {
      console.log("Live tx:", tx);
    }
  }, [tx]);

  return (
    <div className="flex min-h-screen flex-col w-full">
      <main className="flex flex-1 flex-col">
        <TokenInfo token={tokenData} />
        <div className="flex flex-1 flex-col lg:flex-row">
          <div className="grid grid-cols-1 w-full">
            <TokenChart tokenSymbol={tokenData.symbol} />
            <TokenTabs />
          </div>
          <div className="border-l md:w-3/5 lg:w-3/5 xl:w-1/5">
            <TradingPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
