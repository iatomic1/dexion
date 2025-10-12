"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { ZestBorrowModal } from "./borrow-modal";
import { ZestDepositModal } from "./deposit-modal";
import { ZestRepayModal } from "./repay-modal";
import { ZestWithdrawModal } from "./withdraw-modal";

const userData = {
	collateral: 0.45,
	totalBorrowed: 6920.5,
	collateralRatio: 185,
	liquidationRatio: 150,
};

const borrowedAssets = [
	{ token: "aeUSD", amount: 3500, rate: 6.2, liquidationPrice: 38500 },
	{ token: "sUSDT", amount: 2420.5, rate: 5.8, liquidationPrice: 39200 },
	{ token: "xBTC", amount: 0.015, rate: 7.5, liquidationPrice: 35000 },
];

const availableTokens = [
	{ token: "aeUSD", apy: 6.2, available: 5000000 },
	{ token: "sUSDT", apy: 5.8, available: 3200000 },
	{ token: "xBTC", apy: 7.5, available: 125 },
	{ token: "STX", apy: 8.2, available: 850000 },
];

export function ActionsCard() {
	const [isDepositOpen, setIsDepositOpen] = useState(false);
	const [isBorrowOpen, setIsBorrowOpen] = useState(false);
	const [isRepayOpen, setIsRepayOpen] = useState(false);
	const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

	return (
		<>
			<Card className="glass-panel border-border">
				<CardHeader>
					<CardTitle className="text-foreground">Actions</CardTitle>
					<CardDescription className="text-muted-foreground">
						Manage your Zest position
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<Button
							className="h-auto py-6 flex flex-col gap-2 bg-[var(--zest)]/20 hover:bg-[var(--zest)]/30 text-foreground border border-[var(--zest)]/30"
							onClick={() => setIsDepositOpen(true)}
						>
							<ArrowDownRight className="w-5 h-5" />
							<span>Deposit sBTC</span>
						</Button>
						<Button
							className="h-auto py-6 flex flex-col gap-2 bg-primary/20 hover:bg-primary/30 text-foreground border border-primary/30"
							onClick={() => setIsBorrowOpen(true)}
						>
							<ArrowUpRight className="w-5 h-5" />
							<span>Borrow Token</span>
						</Button>
						<Button
							className="h-auto py-6 flex flex-col gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
							onClick={() => setIsRepayOpen(true)}
						>
							<ArrowDownRight className="w-5 h-5" />
							<span>Repay Loan</span>
						</Button>
						<Button
							className="h-auto py-6 flex flex-col gap-2 bg-accent/20 hover:bg-accent/30 text-foreground border border-accent/30"
							onClick={() => setIsWithdrawOpen(true)}
						>
							<ArrowUpRight className="w-5 h-5" />
							<span>Withdraw</span>
						</Button>
					</div>
				</CardContent>
			</Card>

			<ZestDepositModal open={isDepositOpen} onOpenChange={setIsDepositOpen} />
			<ZestBorrowModal
				open={isBorrowOpen}
				onOpenChange={setIsBorrowOpen}
				availableTokens={availableTokens}
				currentRatio={userData.collateralRatio}
			/>
			<ZestRepayModal
				open={isRepayOpen}
				onOpenChange={setIsRepayOpen}
				borrowedAssets={borrowedAssets}
				currentRatio={userData.collateralRatio}
			/>
			<ZestWithdrawModal
				open={isWithdrawOpen}
				onOpenChange={setIsWithdrawOpen}
				collateral={userData.collateral}
				currentRatio={userData.collateralRatio}
			/>
		</>
	);
}
