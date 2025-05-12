"use client";
import { useEffect, useState } from "react";
import TokenChart from "./token-chart";
import TokenInfo from "./token-info";
import TokenTabs from "./token-tabs";
import TradingPanel from "./trading/trading-panel";
import { useTokenSocket } from "~/contexts/TokenWatcherSocketContext";
import type {
  TokenMetadata,
  TokenSwapTransaction,
} from "@repo/token-watcher/token.ts";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@repo/ui/components/ui/resizable";

export default function TokenDetailPage({ ca }: { ca: string }) {
  const tx = useTokenSocket();
  const [tokenData, setTokenData] = useState<TokenMetadata | null>(null);
  const [tradesData, setTradesData] = useState<TokenSwapTransaction[]>([]);

  useEffect(() => {
    if (tx?.contract === ca) {
      console.log("Live/Initial socket data:", tx);

      if (tx.type === "metadata") {
        setTokenData(tx.tokenMetadata);
      } else if (tx.type === "trades") {
        console.log("Received trade update with", tx.trades.length, "trades");

        // Create a new array for state update to ensure triggering re-renders
        setTradesData((prevTrades) => {
          const newTrades = [...tx.trades];
          console.log(
            "Updating trades state from",
            prevTrades.length,
            "to",
            newTrades.length,
          );
          return newTrades;
        });
      }
    }
  }, [tx, ca]);

  if (!tokenData) return <div className="p-4">Loading token data...</div>;

  return (
    <div className="flex min-h-screen flex-col w-full">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        <ResizablePanelGroup direction="horizontal" className="w-full h-full">
          <ResizablePanel defaultSize={75} minSize={50} className="h-full">
            <div className="flex flex-col h-full">
              <TokenInfo token={tokenData} />
              <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="vertical" className="h-full">
                  <ResizablePanel
                    defaultSize={65}
                    minSize={30}
                    className="overflow-hidden"
                  >
                    <TokenChart tokenSymbol={tokenData.symbol} />
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel
                    defaultSize={35}
                    minSize={20}
                    className="overflow-hidden"
                  >
                    <TokenTabs token={tokenData} trades={tradesData} />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            // defaultSize={25}

            minSize={35}
            maxSize={35}
            className="h-full"
          >
            <TradingPanel token={tokenData} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
