"use client";

import { memo, Suspense } from "react";
import TokenInfo from "../token-info";
import TokenChart from "../token-chart";
import TokenTabs from "../token-tabs";
import TradingPanel from "../trading/trading-panel";
import TokenInfoSkeleton from "../skeleton/token-info-skeleton";
import { TokenMetadata } from "@repo/tokens/types";
import {
  useTokenData,
  useTokenMetadata,
} from "~/contexts/TokenWatcherSocketContext";

interface DesktopLayoutProps {
  tokenData: TokenMetadata | null;
}

const DesktopLayout = memo(({ tokenData }: DesktopLayoutProps) => {
  const { isLoading: isLoadingMetadata } = useTokenMetadata();
  return (
    <div className="flex min-h-screen flex-col w-full">
      <div className="flex flex-col sm:flex-row h-[calc(100vh-64px)]">
        <div className="w-full h-full">
          <div className="flex flex-col h-full">
            {/* <Suspense fallback={<TokenInfoSkeleton />}> */}
            {isLoadingMetadata || !tokenData ? (
              <TokenInfoSkeleton />
            ) : (
              <TokenInfo token={tokenData} />
            )}
            {/* </Suspense> */}

            <div className="flex-1 overflow-hidden">
              <div className="h-full w-full flex flex-col">
                <div className="!h-[65%] overflow-hidden">
                  <Suspense
                    fallback={
                      <div className="h-full animate-pulse bg-muted/20" />
                    }
                  >
                    <TokenChart tokenSymbol={tokenData?.symbol} />
                  </Suspense>
                </div>

                <div className="h-[35%] overflow-hidden">
                  <Suspense
                    fallback={
                      <div className="h-full animate-pulse bg-muted/20" />
                    }
                  >
                    <TokenTabs />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[350px] h-full">
          <Suspense
            fallback={<div className="h-full animate-pulse bg-muted/20" />}
          >
            <TradingPanel token={tokenData} />
          </Suspense>
        </div>
      </div>
    </div>
  );
});

DesktopLayout.displayName = "DesktopLayout";
export default DesktopLayout;
