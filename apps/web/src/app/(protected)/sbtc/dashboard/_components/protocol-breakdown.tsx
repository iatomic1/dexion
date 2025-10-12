"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import { ArrowDownRight, ArrowUpRight, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";

const protocolData = [
	{
		name: "Granite",
		color: "var(--granite)",
		collateral: 1.2,
		borrowed: 8500,
		borrowedToken: "aeUSD",
		apy: 5.2,
		link: "/granite",
	},
	{
		name: "StackingDAO",
		color: "var(--stacking)",
		stacked: 0.8,
		yieldEarned: 0.045,
		apy: 8.5,
		link: "/stacking",
	},
	{
		name: "Zest",
		color: "var(--zest)",
		collateral: 0.45,
		borrowed: 6920.5,
		borrowedToken: "Multiple",
		apy: 6.8,
		link: "/zest",
	},
];

export default function ProtocolBreakdown() {
	return (
		<div>
			<h2 className="text-2xl font-bold text-foreground mb-4">
				Protocol Breakdown
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{protocolData.map((protocol) => (
					<Link key={protocol.name} href={"/sbtc" + protocol.link}>
						<Card className="glass-panel border-border hover:bg-secondary/30 transition-all cursor-pointer h-full">
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-foreground flex items-center gap-2">
										<div
											className="w-3 h-3 rounded-full"
											style={{ backgroundColor: protocol.color }}
										/>
										{protocol.name}
									</CardTitle>
									<ArrowUpRight className="w-5 h-5 text-muted-foreground" />
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{protocol.name === "StackingDAO" ? (
									<>
										<div className="space-y-1">
											<p className="text-sm text-muted-foreground">Stacked</p>
											<p className="text-2xl font-bold text-foreground">
												{protocol.stacked} sBTC
											</p>
										</div>
										<div className="space-y-1">
											<p className="text-sm text-muted-foreground">
												Yield Earned
											</p>
											<p className="text-xl font-semibold text-foreground">
												{protocol.yieldEarned} sBTC
											</p>
										</div>
									</>
								) : (
									<>
										<div className="space-y-1">
											<p className="text-sm text-muted-foreground">
												Collateral
											</p>
											<p className="text-2xl font-bold text-foreground">
												{protocol.collateral} sBTC
											</p>
										</div>
										<div className="space-y-1">
											<p className="text-sm text-muted-foreground">Borrowed</p>
											<p className="text-xl font-semibold text-foreground">
												{typeof protocol.borrowed === "number"
													? protocol.borrowed.toLocaleString()
													: protocol.borrowed}{" "}
												{protocol.borrowedToken}
											</p>
										</div>
									</>
								)}
								<div className="pt-2 border-t border-border">
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">APY</span>
										<span className="text-sm font-semibold text-green-400">
											{protocol.apy}%
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
