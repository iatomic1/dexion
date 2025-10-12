"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import { ArrowDownRight, ArrowUpRight, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Session } from "~/types/auth";
import { DashboardNav } from "../_components/dashboard-nav";
import { WalletModal } from "../_components/wallet-modal";
import PortfolioSummary from "./portfolio-summary";
import ProtocolBreakdown from "./protocol-breakdown";

export default function DashboardContent({ session }: { session: Session }) {
	const [isWalletOpen, setIsWalletOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const portfolioData = {
		totalSBTC: 2.45,
		borrowedValue: 15420.5,
		netWorth: 83245.75,
		change24h: 3.2,
	};

	const recentTransactions = [
		{
			id: "1",
			date: "2025-01-09",
			type: "Deposit",
			protocol: "Granite",
			amount: "+0.5 sBTC",
			status: "Confirmed",
			txid: "abc123...",
		},
		{
			id: "2",
			date: "2025-01-08",
			type: "Borrow",
			protocol: "Granite",
			amount: "2,500 aeUSD",
			status: "Confirmed",
			txid: "def456...",
		},
		{
			id: "3",
			date: "2025-01-08",
			type: "Stack",
			protocol: "StackingDAO",
			amount: "+0.3 sBTC",
			status: "Confirmed",
			txid: "ghi789...",
		},
		{
			id: "4",
			date: "2025-01-07",
			type: "Transfer",
			protocol: "Wallet",
			amount: "-0.1 sBTC",
			status: "Confirmed",
			txid: "jkl012...",
		},
		{
			id: "5",
			date: "2025-01-07",
			type: "Claim",
			protocol: "StackingDAO",
			amount: "+0.015 sBTC",
			status: "Pending",
			txid: "mno345...",
		},
	];

	return (
		<div className="min-h-screen gradient-bg">
			<DashboardNav
				onWalletClick={() => setIsWalletOpen(true)}
				onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
			/>

			<main className="container mx-auto px-4 py-8 space-y-8">
				<PortfolioSummary session={session} />

				{/* Protocol Breakdown */}
				<ProtocolBreakdown />

				{/* Actions Bar */}
				<Card className="glass-panel border-border">
					<CardHeader>
						<CardTitle className="text-foreground">Quick Actions</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<Button className="h-auto py-6 flex flex-col gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
								<ArrowDownRight className="w-5 h-5" />
								<span>Deposit</span>
							</Button>
							<Button className="h-auto py-6 flex flex-col gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground">
								<ArrowUpRight className="w-5 h-5" />
								<span>Borrow</span>
							</Button>
							<Button className="h-auto py-6 flex flex-col gap-2 bg-[var(--stacking)]/20 hover:bg-[var(--stacking)]/30 text-foreground border border-[var(--stacking)]/30">
								<TrendingUp className="w-5 h-5" />
								<span>Stake</span>
							</Button>
							<Button
								className="h-auto py-6 flex flex-col gap-2 bg-accent/20 hover:bg-accent/30 text-foreground border border-accent/30"
								asChild
							>
								<Link href="/transfer">
									<Wallet className="w-5 h-5" />
									<span>Transfer</span>
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Recent Transactions */}
				<Card className="glass-panel border-border">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-foreground">
								Recent Transactions
							</CardTitle>
							<Button variant="ghost" size="sm" asChild>
								<Link
									href="/history"
									className="text-primary hover:text-primary/80"
								>
									View All
								</Link>
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{recentTransactions.map((tx) => (
								<div
									key={tx.id}
									className="flex items-center justify-between py-3 border-b border-border last:border-0"
								>
									<div className="flex items-center gap-4">
										<div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
											{tx.type === "Deposit" || tx.type === "Stack" ? (
												<ArrowDownRight className="w-5 h-5 text-green-400" />
											) : (
												<ArrowUpRight className="w-5 h-5 text-blue-400" />
											)}
										</div>
										<div>
											<p className="font-medium text-foreground">{tx.type}</p>
											<p className="text-sm text-muted-foreground">
												{tx.protocol} • {tx.date}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-semibold text-foreground">{tx.amount}</p>
										<div className="flex items-center gap-2">
											<Badge
												variant={
													tx.status === "Confirmed" ? "secondary" : "outline"
												}
												className={
													tx.status === "Confirmed"
														? "bg-green-500/20 text-green-400 border-green-500/30"
														: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
												}
											>
												{tx.status}
											</Badge>
											<a
												href={`https://explorer.stacks.co/txid/${tx.txid}`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-xs text-primary hover:underline"
											>
												{tx.txid}
											</a>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</main>

			<WalletModal open={isWalletOpen} onOpenChange={setIsWalletOpen} />
		</div>
	);
}
