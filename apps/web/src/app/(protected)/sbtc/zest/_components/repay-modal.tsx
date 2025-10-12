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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/ui/select";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ZestRepayModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	borrowedAssets: Array<{ token: string; amount: number; rate: number }>;
	currentRatio: number;
}

export function ZestRepayModal({
	open,
	onOpenChange,
	borrowedAssets,
	currentRatio,
}: ZestRepayModalProps) {
	const [selectedToken, setSelectedToken] = useState("");
	const [amount, setAmount] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [newRatio, setNewRatio] = useState(currentRatio);

	const selectedAsset = borrowedAssets.find((a) => a.token === selectedToken);

	useEffect(() => {
		if (amount && Number.parseFloat(amount) > 0 && selectedAsset) {
			const repayAmount = Number.parseFloat(amount);
			const ratioIncrease = (repayAmount / selectedAsset.amount) * 30;
			setNewRatio(currentRatio + ratioIncrease);
		} else {
			setNewRatio(currentRatio);
		}
	}, [amount, selectedToken, selectedAsset, currentRatio]);

	const handleRepay = async () => {
		setIsLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 2000));
		setIsLoading(false);
		onOpenChange(false);
		setAmount("");
		setSelectedToken("");
	};

	const estimatedGas = 0.0001;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="glass-panel border-border bg-background/95 backdrop-blur-xl">
				<DialogHeader>
					<DialogTitle className="text-foreground">Repay Loan</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Repay your borrowed tokens to improve your position
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<div className="space-y-2">
						<Label htmlFor="token-select" className="text-foreground">
							Select Token to Repay
						</Label>
						<Select value={selectedToken} onValueChange={setSelectedToken}>
							<SelectTrigger
								id="token-select"
								className="bg-secondary/50 border-border text-foreground"
							>
								<SelectValue placeholder="Choose a token" />
							</SelectTrigger>
							<SelectContent className="glass-panel border-border bg-background/95 backdrop-blur-xl">
								{borrowedAssets.map((asset) => (
									<SelectItem key={asset.token} value={asset.token}>
										{asset.token} - {asset.amount.toLocaleString()} borrowed
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{selectedToken && selectedAsset && (
						<>
							<div className="space-y-2">
								<Label htmlFor="repay-amount" className="text-foreground">
									Amount ({selectedToken})
								</Label>
								<div className="relative">
									<Input
										id="repay-amount"
										type="number"
										placeholder="0.0"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										className="pr-16 bg-secondary/50 border-border text-foreground"
										step={selectedToken === "xBTC" ? "0.001" : "100"}
										min="0"
										max={selectedAsset.amount}
									/>
									<Button
										variant="ghost"
										size="sm"
										className="absolute right-2 top-1/2 -translate-y-1/2 h-7 text-xs text-primary hover:text-primary/80"
										onClick={() => setAmount(selectedAsset.amount.toString())}
									>
										MAX
									</Button>
								</div>
								<p className="text-xs text-muted-foreground">
									Total debt: {selectedAsset.amount.toLocaleString()}{" "}
									{selectedToken}
								</p>
							</div>

							<div className="space-y-2 p-4 rounded-lg bg-secondary/30 border border-border">
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Interest Rate</span>
									<span className="text-foreground font-medium">
										{selectedAsset.rate}%
									</span>
								</div>
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
									<span className="text-green-400 font-semibold">
										{newRatio.toFixed(1)}%
									</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">
										Estimated Gas Fee
									</span>
									<span className="text-foreground font-medium">
										{estimatedGas} sBTC
									</span>
								</div>
							</div>
						</>
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
							className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
							onClick={handleRepay}
							disabled={
								!selectedToken ||
								!amount ||
								Number.parseFloat(amount) <= 0 ||
								Number.parseFloat(amount) > (selectedAsset?.amount || 0) ||
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
