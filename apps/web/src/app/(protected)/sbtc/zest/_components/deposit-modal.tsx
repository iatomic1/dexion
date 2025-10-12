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
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ZestDepositModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ZestDepositModal({
	open,
	onOpenChange,
}: ZestDepositModalProps) {
	const [amount, setAmount] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const availableBalance = 1.25;

	const handleDeposit = async () => {
		setIsLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 2000));
		setIsLoading(false);
		onOpenChange(false);
		setAmount("");
	};

	const estimatedGas = 0.0001;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="glass-panel border-border bg-background/95 backdrop-blur-xl">
				<DialogHeader>
					<DialogTitle className="text-foreground">Deposit sBTC</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Add sBTC collateral to your Zest position
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<div className="space-y-2">
						<Label htmlFor="deposit-amount" className="text-foreground">
							Amount (sBTC)
						</Label>
						<div className="relative">
							<Input
								id="deposit-amount"
								type="number"
								placeholder="0.0"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								className="pr-16 bg-secondary/50 border-border text-foreground"
								step="0.01"
								min="0"
								max={availableBalance}
							/>
							<Button
								variant="ghost"
								size="sm"
								className="absolute right-2 top-1/2 -translate-y-1/2 h-7 text-xs text-primary hover:text-primary/80"
								onClick={() => setAmount(availableBalance.toString())}
							>
								MAX
							</Button>
						</div>
						<p className="text-xs text-muted-foreground">
							Available: {availableBalance} sBTC
						</p>
					</div>

					<div className="space-y-2 p-4 rounded-lg bg-secondary/30 border border-border">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Estimated Gas Fee</span>
							<span className="text-foreground font-medium">
								{estimatedGas} sBTC
							</span>
						</div>
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Total Cost</span>
							<span className="text-foreground font-semibold">
								{amount
									? (Number.parseFloat(amount) + estimatedGas).toFixed(4)
									: "0.0000"}{" "}
								sBTC
							</span>
						</div>
					</div>

					<div className="flex gap-3">
						<Button
							variant="outline"
							className="flex-1 border-border bg-transparent"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							className="flex-1 bg-[var(--zest)] hover:bg-[var(--zest)]/90 text-white"
							onClick={handleDeposit}
							disabled={
								!amount ||
								Number.parseFloat(amount) <= 0 ||
								Number.parseFloat(amount) > availableBalance ||
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
