"use client";

import TokenAudit from "./token-audit";
import PresetTabs from "./preset-tabs";
import { DexBanner } from "./dex-banner";
import { TokenMetadata } from "@repo/token-watcher/token.ts";
import Pools from "./pools";
import TradingInterface from "./trading-interface";

interface TradingPanelProps {
  token: TokenMetadata;
  // holders: TokenHolder[];
  // pools: LiquidityPool[];
}

export default function TradingPanel({
  token,
  // holders,
  // pools,
}: TradingPanelProps) {
  return (
    <div className="sm:flex h-full flex-col hidden">
      <div className="flex flex-col p-4">
        {/* <TradingStats /> */}
        <PresetTabs />
        {/* <TradingInterface /> */}
        <TokenAudit token={token} />
        <Pools />
        {/* <SimilarTokens token={token} /> */}
        <DexBanner bannerUrl={token?.header_image_url} />
      </div>
    </div>
  );
}
