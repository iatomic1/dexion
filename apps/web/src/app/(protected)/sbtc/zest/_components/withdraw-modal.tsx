"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ZestWithdrawModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	collateral: number;
	currentRatio: number;
}

export function ZestWithdrawModal({
	open,
	onOpenChange,
	collateral,
	currentRatio,
}: ZestWithdrawModalProps) {
	const [amount, setAmount] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [newRatio, setNewRatio] = useState(currentRatio);
	const maxWithdrawable = collateral * 0.35;

	useEffect(() => {
		if (amount && Number.parseFloat(amount) > 0) {
			const withdrawAmount = Number.parseFloat(amount);
			const ratioDecrease = (withdrawAmount / collateral) * 75;
			setNewRatio(Math.max(150, currentRatio - ratioDecrease));
		} else {
			setNewRatio(currentRatio);
		}
	}, [amount, collateral, currentRatio]);

	const handleWithdraw = async () => {
		setIsLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 2000));
		setIsLoading(false);
		onOpenChange(false);
		setAmount("");
	};

	const estimatedGas = 0.0001;
	const isRisky = newRatio < 160;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="glass-panel border-border bg-background/95 backdrop-blur-xl">
				<DialogHeader>
					<DialogTitle className="text-foreground">
						Withdraw Collateral
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Withdraw sBTC collateral from your Zest position
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<div className="space-y-2">
						<Label htmlFor="withdraw-amount" className="text-foreground">
							Amount (sBTC)
						</Label>
						<div className="relative">
							<Input
								id="withdraw-amount"
								type="number"
								placeholder="0.0"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								className="pr-16 bg-secondary/50 border-border text-foreground"
								step="0.01"
								min="0"
								max={maxWithdrawable}
							/>
							<Button
								variant="ghost"
								size="sm"
								className="absolute right-2 top-1/2 -translate-y-1/2 h-7 text-xs text-primary hover:text-primary/80"
								onClick={() => setAmount(maxWithdrawable.toFixed(4))}
							>
								MAX
							</Button>
						</div>
						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">
								Total collateral: {collateral} sBTC
							</span>
							<span className="text-muted-foreground">
								Max withdrawable: {maxWithdrawable.toFixed(4)} sBTC
							</span>
						</div>
					</div>

					<div className="space-y-2 p-4 rounded-lg bg-secondary/30 border border-border">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">
								Current Collateral Ratio
							</span>
							<span className="text-foreground font-medium">
								{currentRatio}%
							</span>
						</div>
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">
								New Collateral Ratio
							</span>
							<span
								className={`font-semibold ${
									newRatio > 200
										? "text-green-400"
										: newRatio > 160
											? "text-yellow-400"
											: "text-red-400"
								}`}
							>
								{newRatio.toFixed(1)}%
							</span>
						</div>
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Estimated Gas Fee</span>
							<span className="text-foreground font-medium">
								{estimatedGas} sBTC
							</span>
						</div>
					</div>

					{isRisky && amount && Number.parseFloat(amount) > 0 && (
						<div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
							<AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
							<div className="space-y-1">
								<p className="text-sm font-medium text-yellow-400">
									High Risk Warning
								</p>
								<p className="text-xs text-yellow-400/80">
									This withdrawal will put your position at risk of liquidation.
									Consider withdrawing less.
								</p>
							</div>
						</div>
					)}

					<div className="flex gap-3">
						<Button
							variant="outline"
							className="flex-1 border-border bg-transparent"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							className="flex-1 bg-accent hover:bg-accent/90 text-white"
							onClick={handleWithdraw}
							disabled={
								!amount ||
								Number.parseFloat(amount) <= 0 ||
								Number.parseFloat(amount) > maxWithdrawable ||
								isLoading
							}
						>
							{isLoading ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Signing...
								</>
							) : (
								"Sign with Turnkey Wallet"
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
