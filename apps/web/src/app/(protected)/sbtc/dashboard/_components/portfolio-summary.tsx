import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Markup } from "interweave";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useBtcStxPriceContext } from "~/contexts/BtcStxPriceContext";
import { formatPrice, formatTinyDecimal } from "~/lib/helpers/numbers";
import { getBalance } from "~/lib/queries/hiro";
import { formatTokenBalance } from "~/lib/utils/token";
import { Session } from "~/types/auth";

const portfolioData = {
	totalSBTC: 2.45,
	borrowedValue: 15420.5,
	netWorth: 83245.75,
	change24h: 3.2,
};

export default function PortfolioSummary({ session }: { session: Session }) {
	const {
		data: balanceData,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: [`balance-${session?.user.walletAddress}`],
		queryFn: () => getBalance(session?.user.walletAddress as string),
		enabled: !!session?.user.walletAddress,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});

	const rawBalance = useMemo(() => {
		if (!balanceData) return "0";

		return (
			balanceData.fungible_tokens[
				"SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token"
			]?.balance ?? "0"
		);
	}, [balanceData]);

	const {
		prices,
		isLoading: isPriceLoading,
		isError,
	} = useBtcStxPriceContext();

	const formattedBalance = formatTokenBalance(rawBalance, 8);

	const tokenPrice = useMemo(() => {
		return prices?.find((p) => p.symbol.toLowerCase() === "btc");
	}, [prices]);

	const totalValue = useMemo(() => {
		return ((tokenPrice?.current_price ?? 0) * formattedBalance).toFixed(2);
	}, [tokenPrice, formattedBalance]);

	return (
		<>
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<div className="flex items-center gap-3">
						{isLoading ? (
							<Skeleton className="h-[42px] w-[128px]" />
						) : (
							<span className="text-5xl self-baseline font-bold text-foreground">
								<Markup
									content={
										formattedBalance > 1
											? formatPrice(formattedBalance)
											: formatTinyDecimal(formattedBalance)
									}
								/>
							</span>
						)}

						<span className="text-2xl text-muted-foreground">sBTC</span>
						<Badge
							variant="secondary"
							className="ml-2 bg-green-500/20 text-green-400 border-green-500/30"
						>
							<TrendingUp className="w-3 h-3 mr-1" />+{portfolioData.change24h}%
						</Badge>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						className="glass-panel border-border bg-transparent"
						asChild
					>
						<Link href="/transfer">Transfer sBTC</Link>
					</Button>
				</div>
			</div>

			{/* Portfolio Summary */}
			<Card className="glass-panel border-border">
				<CardHeader>
					<CardTitle className="text-foreground">Portfolio Summary</CardTitle>
					<CardDescription className="text-muted-foreground">
						Your total DeFi positions across all protocols
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="space-y-2">
							<p className="text-sm text-muted-foreground">Total sBTC Value</p>
							<p className="text-3xl font-bold text-foreground">
								${totalValue}
							</p>
						</div>
						<div className="space-y-2">
							<p className="text-sm text-muted-foreground">Total Borrowed</p>
							<p className="text-3xl font-bold text-foreground">
								${portfolioData.borrowedValue.toLocaleString()}
							</p>
						</div>
						<div className="space-y-2">
							<p className="text-sm text-muted-foreground">Net Worth</p>
							<p className="text-3xl font-bold text-foreground">
								$
								{(
									portfolioData.netWorth - portfolioData.borrowedValue
								).toLocaleString()}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</>
	);
}
