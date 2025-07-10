"use client";

import type { TokenMetadata } from "@repo/tokens/types";
import { DexBanner } from "./dex-banner";
import Pools from "./pools";
import TokenAudit from "./token-audit";

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
				<TokenAudit token={token} />
				{token.source === "stxtools" && <Pools />}
				{/* <SimilarTokens token={token} /> */}
				<DexBanner bannerUrl={token?.header_image_url} />
			</div>
		</div>
	);
}
