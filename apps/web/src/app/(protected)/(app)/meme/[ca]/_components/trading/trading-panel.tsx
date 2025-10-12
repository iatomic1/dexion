"use client";

import type { TokenMetadata } from "@repo/tokens/types";
import { PresetsContextProvider } from "~/contexts/PresetsContext";
import { DexBanner } from "./dex-banner";
import Pools from "./pools";
import TokenAudit from "./token-audit";
import TradingInterfaceDesktop from "./trading-interface-desktop";

interface TradingPanelProps {
	token: TokenMetadata;
	bitflowTokenId: string | null;
	// holders: TokenHolder[];
	// pools: LiquidityPool[];
}

export default function TradingPanel({
	token,
	bitflowTokenId,
	// holders,
	// pools,
}: TradingPanelProps) {
	return (
		<div className="sm:flex h-full flex-col hidden">
			<div className="flex flex-col p-4">
				{/* <TradingStats /> */}
				<PresetsContextProvider>
					<TradingInterfaceDesktop
						token={token}
						bitflowTokenId={bitflowTokenId}
					/>
				</PresetsContextProvider>
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
