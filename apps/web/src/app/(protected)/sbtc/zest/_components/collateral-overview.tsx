"use client";
import { Badge } from "@repo/ui/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getZestAssetPrices } from "~/lib/queries/sbtc/zest";
import {
	ZestAssetPriceResponse,
	ZestUserAssetsResponse,
} from "~/types/sbtc/zest";

export const calculateZestUserTotalsWithPrices = (
	assets: ZestUserAssetsResponse["assets"],
	prices: ZestAssetPriceResponse,
) => {
	const decimals: Record<string, number> = {
		sBTC: 8,
		USDh: 8,
		aUSD: 8,
		ALEX: 8,
		STX: 6,
		stSTX: 6,
		stSTXbtc: 6,
		aeUSDC: 6,
		USDA: 6,
		DIKO: 6,
	};

	let totalSupplied = 0;
	let totalBorrowed = 0;

	const sbtc = assets.sBTC;
	const sbtcPrice = prices.sBTC;
	if (sbtc && sbtcPrice) {
		const price = Number(sbtcPrice.price) / 1e8;
		const supplied = Number(sbtc.suppliedBalance) / 10 ** decimals.sBTC;
		totalSupplied = supplied * price;
	}

	for (const [symbol, asset] of Object.entries(assets)) {
		const priceData = prices[symbol as keyof ZestAssetPriceResponse];
		const dec = decimals[symbol] ?? 6;
		if (!priceData) continue;

		const price = Number(priceData.price) / 1e8;
		const borrowed = Number(asset.borrowedBalance) / 10 ** dec;

		totalBorrowed += borrowed * price;
	}

	return { totalSupplied, totalBorrowed };
};

export default function CollateralOverview({
	userAssets,
	pricesData,
}: {
	userAssets: ZestUserAssetsResponse["assets"];
	pricesData: ZestAssetPriceResponse;
}) {
	// const {
	//   data: pricesData,
	//   isLoading,
	//   refetch,
	// } = useQuery({
	//   queryKey: [],
	//   queryFn: () => getZestAssetPrices(),
	//   refetchOnWindowFocus: false,
	//   refetchOnReconnect: true,
	//   staleTime: 1000 * 60 * 5,
	// });

	const totals = useMemo(() => {
		if (!userAssets || !pricesData)
			return { totalSupplied: 0, totalBorrowed: 0 };
		return calculateZestUserTotalsWithPrices(userAssets, pricesData);
	}, [userAssets, pricesData]);

	const collateralRatio =
		totals.totalBorrowed > 0
			? (totals.totalSupplied / totals.totalBorrowed) * 100
			: 0;

	const liquidationRatio = 150;

	return (
		<Card className="glass-panel border-border">
			<CardHeader>
				<CardTitle className="text-foreground">Collateral Overview</CardTitle>
				<CardDescription className="text-muted-foreground">
					Your sBTC collateral position
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">Total Collateral</p>
						<p className="text-3xl font-bold text-foreground">
							{Number(userAssets.sBTC.suppliedBalance) / 8} sBTC
						</p>
					</div>
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">Total Borrowed</p>
						<p className="text-3xl font-bold text-foreground">
							${totals.totalBorrowed.toLocaleString()}
						</p>
					</div>
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">Collateral Ratio</p>
						<Badge
							variant="secondary"
							className={
								collateralRatio > 200
									? "bg-green-500/20 text-green-400 border-green-500/30 text-xl px-3 py-1"
									: collateralRatio > 150
										? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xl px-3 py-1"
										: "bg-red-500/20 text-red-400 border-red-500/30 text-xl px-3 py-1"
							}
						>
							{collateralRatio.toFixed(2)}%
						</Badge>
					</div>
					{/*<div className="space-y-2">
            <p className="text-sm text-muted-foreground">Liquidation Ratio</p>
            <p className="text-2xl font-semibold text-foreground">
              {liquidationRatio}%
            </p>
          </div>*/}
				</div>
			</CardContent>
		</Card>
	);
}
