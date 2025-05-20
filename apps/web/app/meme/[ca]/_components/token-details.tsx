"use client";
import { useEffect, useState } from "react";
import TokenChart from "./token-chart";
import TokenInfo from "./token-info";
import TokenTabs from "./token-tabs";
import TradingPanel from "./trading/trading-panel";
import {
  useTokenData,
  useTokenSocket,
} from "~/contexts/TokenWatcherSocketContext";
import type {
  LiquidityPool,
  TokenHolder,
  TokenMetadata,
  TokenSwapTransaction,
} from "@repo/token-watcher/token.ts";
import TokenInfoSkeleton from "./skeleton/token-info-skeleton";

export default function TokenDetailPage({ ca }: { ca: string }) {
  const { tokenData, isLoadingMetadata, holdersData, poolsData, tradesData } =
    useTokenData();

  return (
    <div className="flex min-h-screen flex-col w-full">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        {/* Main content area - 75% on desktop */}
        <div className="w-full lg:w-3/4 h-full">
          <div className="flex flex-col h-full">
            {isLoadingMetadata || !tokenData ? (
              <TokenInfoSkeleton />
            ) : (
              <TokenInfo token={tokenData} />
            )}

            <div className="flex-1 overflow-hidden">
              <div className="h-full w-full flex flex-col">
                {/* Chart section - 65% height */}
                <div className="!h-[65%] overflow-hidden">
                  <TokenChart tokenSymbol={tokenData?.symbol} />
                </div>

                {/* Tabs section - 35% height */}
                <div className="h-[35%] overflow-hidden">
                  <TokenTabs
                  // token={tokenData && tokenData}
                  // trades={tradesData}
                  // holders={holdersData}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trading panel - 25% on desktop */}
        <div className="w-full lg:w-1/3 h-full">
          {tokenData && (
            <TradingPanel
              token={tokenData}
              holders={holdersData}
              pools={poolsData as LiquidityPool[]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
