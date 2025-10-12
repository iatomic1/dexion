"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getZestReserve } from "~/lib/queries/sbtc/zest";
import {
	ZestAssetPriceResponse,
	ZestReserveResponse,
	ZestUserAssetsResponse,
} from "~/types/sbtc/zest";

export default function BorrowedAssets({
	userAssets,
	reserveData,
	pricesData,
}: {
	userAssets: ZestUserAssetsResponse["assets"];
	reserveData: ZestReserveResponse;
	pricesData: ZestAssetPriceResponse;
}) {
	const [tokenFilter, setTokenFilter] = useState("all");

	// const {
	//   data: reserveData,
	//   isLoading,
	//   refetch,
	// } = useQuery({
	//   queryKey: ["zest-reserve"],
	//   queryFn: () => getZestReserve(),
	//   refetchOnWindowFocus: false,
	//   refetchOnReconnect: true,
	//   staleTime: 1000 * 60 * 5,
	// });
	// useEffect(() => {
	//   console.log(reserveData);
	// }, [reserveData]);

	const borrowedAssets = useMemo(() => {
		if (!userAssets) return [];

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

		return Object.entries(userAssets).map(([symbol, asset]) => {
			const borrowed =
				Number(asset.borrowedBalance || 0) / 10 ** (decimals[symbol] ?? 6);
			const apr =
				reserveData?.[symbol as keyof typeof reserveData]?.borrowAPR ?? "0";
			console.log(apr);
			const rate = Number(apr);
			return {
				token: symbol,
				amount: borrowed,
				rate,
			};
		});
	}, [userAssets, reserveData]);

	const filteredAssets =
		tokenFilter === "all"
			? borrowedAssets
			: borrowedAssets.filter((asset) => asset.token === tokenFilter);

	return (
		<Card className="glass-panel border-border">
			<CardHeader>
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<CardTitle className="text-foreground">Borrowed Assets</CardTitle>
						<CardDescription className="text-muted-foreground">
							Your active loans across multiple tokens
						</CardDescription>
					</div>
					<Select value={tokenFilter} onValueChange={setTokenFilter}>
						<SelectTrigger className="w-[180px] glass-panel border-border bg-transparent">
							<Filter className="w-4 h-4 mr-2" />
							<SelectValue placeholder="Filter by token" />
						</SelectTrigger>
						<SelectContent className="glass-panel border-border bg-background/95 backdrop-blur-xl">
							<SelectItem value="all">All Tokens</SelectItem>
							{Object.keys(userAssets).map((symbol) => (
								<SelectItem key={symbol} value={symbol}>
									{symbol}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</CardHeader>

			<CardContent>
				<div className="space-y-4">
					{filteredAssets.length > 0 ? (
						filteredAssets.map((asset) => (
							<div
								key={asset.token}
								className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border gap-4"
							>
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 rounded-full bg-[var(--zest)]/20 flex items-center justify-center">
										<span className="text-sm font-bold text-[var(--zest)]">
											{asset.token.slice(0, 2)}
										</span>
									</div>
									<div>
										<p className="font-semibold text-foreground">
											{asset.token}
										</p>
										<p className="text-sm text-muted-foreground">
											Interest Rate: {asset.rate}%
										</p>
									</div>
								</div>
								<div className="flex items-center gap-8">
									<div className="text-right">
										<p className="text-sm text-muted-foreground">Borrowed</p>
										<p className="text-lg font-semibold text-foreground">
											{asset.amount < 1
												? asset.amount.toFixed(6)
												: asset.amount.toLocaleString()}{" "}
											{asset.token}
										</p>
									</div>
								</div>
							</div>
						))
					) : (
						<div className="text-center py-8 text-muted-foreground">
							No borrowed assets found for this filter.
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
