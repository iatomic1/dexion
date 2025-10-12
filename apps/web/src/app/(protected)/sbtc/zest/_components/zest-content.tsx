import { Suspense } from "react";
import {
	ZestAssetPriceResponse,
	ZestReserveResponse,
	ZestUserAssetsResponse,
} from "~/types/sbtc/zest";
import { ActionsCard } from "./actions-card";
import AvailableToBorrow from "./available-to-borrow";
import BorrowedAssets from "./borrowed-assets";
import CollateralOverview from "./collateral-overview";
import { DashboardNavWrapper } from "./dashboard-nav-wrapper";

export default function ZestContent({
	walletAddress,
	userAssetsRes,
	reserveData,
	pricesData,
}: {
	walletAddress: string;
	userAssetsRes: ZestUserAssetsResponse;
	reserveData: ZestReserveResponse;
	pricesData: ZestAssetPriceResponse;
}) {
	const borrowedAssets = [
		{ token: "aeUSD", amount: 3500, rate: 6.2, liquidationPrice: 38500 },
		{ token: "sUSDT", amount: 2420.5, rate: 5.8, liquidationPrice: 39200 },
		{ token: "xBTC", amount: 0.015, rate: 7.5, liquidationPrice: 35000 },
	];

	return (
		<div className="min-h-screen gradient-bg">
			<DashboardNavWrapper />

			<main className="container mx-auto px-4 py-8 space-y-8">
				{/* Header */}
				<div className="flex items-center gap-4">
					<div className="w-16 h-16 rounded-2xl bg-[var(--zest)]/20 border border-[var(--zest)]/30 flex items-center justify-center">
						<div className="w-8 h-8 rounded-full bg-[var(--zest)]" />
					</div>
					<div>
						<h1 className="text-3xl md:text-4xl font-bold text-foreground">
							Zest
						</h1>
						<p className="text-muted-foreground">
							Leverage your sBTC to borrow multiple tokens
						</p>
					</div>
				</div>

				{/* Collateral Overview */}
				<Suspense fallback={<p>Loading</p>}>
					<CollateralOverview
						userAssets={userAssetsRes?.assets}
						pricesData={pricesData}
					/>
				</Suspense>

				{/* Borrowed Assets */}
				<BorrowedAssets
					userAssets={userAssetsRes.assets}
					pricesData={pricesData}
					reserveData={reserveData}
				/>

				{/* Actions */}
				<ActionsCard />

				{/* Available to Borrow */}
				<AvailableToBorrow />
			</main>
		</div>
	);
}
