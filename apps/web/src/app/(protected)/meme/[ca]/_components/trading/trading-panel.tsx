"use client";

import { DexBanner } from "./dex-banner";
import { TokenMetadata } from "@repo/tokens/types";
import Pools from "./pools";

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
        {/* <TradingInterfaceDesktop /> */}
        {/* <PresetTabs /> */}
        {/* <TradingInterface /> */}
        {/* <TokenAudit token={token} /> */}
        <Pools />
        {/* <SimilarTokens token={token} /> */}
        <DexBanner bannerUrl={token?.header_image_url} />
      </div>
    </div>
  );
}
