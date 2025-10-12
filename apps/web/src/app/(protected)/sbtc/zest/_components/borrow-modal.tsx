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
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ZestBorrowModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	availableTokens: Array<{ token: string; apy: number; available: number }>;
	currentRatio: number;
}

export function ZestBorrowModal({
	open,
	onOpenChange,
	availableTokens,
	currentRatio,
}: ZestBorrowModalProps) {
	const [selectedToken, setSelectedToken] = useState("");
	const [amount, setAmount] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [newRatio, setNewRatio] = useState(currentRatio);
	const [liquidationRisk, setLiquidationRisk] = useState<
		"low" | "medium" | "high"
	>("low");

	const selectedTokenData = availableTokens.find(
		(t) => t.token === selectedToken,
	);

	useEffect(() => {
		if (amount && Number.parseFloat(amount) > 0 && selectedTokenData) {
			const borrowAmount = Number.parseFloat(amount);
			const maxBorrow = selectedTokenData.available * 0.1;
			const ratioDecrease = (borrowAmount / maxBorrow) * 50;
			const calculatedRatio = Math.max(150, currentRatio - ratioDecrease);
			setNewRatio(calculatedRatio);

			if (calculatedRatio < 160) {
				setLiquidationRisk("high");
			} else if (calculatedRatio < 180) {
				setLiquidationRisk("medium");
			} else {
				setLiquidationRisk("low");
			}
		} else {
			setNewRatio(currentRatio);
			setLiquidationRisk("low");
		}
	}, [amount, selectedToken, selectedTokenData, currentRatio]);

	const handleBorrow = async () => {
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
					<DialogTitle className="text-foreground">Borrow Token</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Select a token and amount to borrow against your collateral
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<div className="space-y-2">
						<Label htmlFor="token-select" className="text-foreground">
							Select Token
						</Label>
						<Select value={selectedToken} onValueChange={setSelectedToken}>
							<SelectTrigger
								id="token-select"
								className="bg-secondary/50 border-border text-foreground"
							>
								<SelectValue placeholder="Choose a token" />
							</SelectTrigger>
							<SelectContent className="glass-panel border-border bg-background/95 backdrop-blur-xl">
								{availableTokens.map((token) => (
									<SelectItem key={token.token} value={token.token}>
										{token.token} - {token.apy}% APY
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{selectedToken && (
						<>
							<div className="space-y-2">
								<Label htmlFor="borrow-amount" className="text-foreground">
									Amount ({selectedToken})
								</Label>
								<div className="relative">
									<Input
										id="borrow-amount"
										type="number"
										placeholder="0.0"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										className="pr-16 bg-secondary/50 border-border text-foreground"
										step={selectedToken === "xBTC" ? "0.001" : "100"}
										min="0"
									/>
									<Button
										variant="ghost"
										size="sm"
										className="absolute right-2 top-1/2 -translate-y-1/2 h-7 text-xs text-primary hover:text-primary/80"
										onClick={() =>
											setAmount((selectedTokenData!.available * 0.1).toString())
										}
									>
										MAX
									</Button>
								</div>
								<p className="text-xs text-muted-foreground">
									Available: {selectedTokenData?.available.toLocaleString()}{" "}
									{selectedToken}
								</p>
							</div>

							<div className="space-y-2 p-4 rounded-lg bg-secondary/30 border border-border">
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Interest Rate</span>
									<span className="text-foreground font-medium">
										{selectedTokenData?.apy}%
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
									<span className="text-muted-foreground">
										Liquidation Risk
									</span>
									<span
										className={`font-semibold ${
											liquidationRisk === "low"
												? "text-green-400"
												: liquidationRisk === "medium"
													? "text-yellow-400"
													: "text-red-400"
										}`}
									>
										{liquidationRisk.toUpperCase()}
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

							{liquidationRisk === "high" &&
								amount &&
								Number.parseFloat(amount) > 0 && (
									<div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
										<AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
										<div className="space-y-1">
											<p className="text-sm font-medium text-red-400">
												High Liquidation Risk
											</p>
											<p className="text-xs text-red-400/80">
												This borrow amount puts your position at significant
												risk. Consider borrowing less or adding more collateral.
											</p>
										</div>
									</div>
								)}
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
							className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
							onClick={handleBorrow}
							disabled={
								!selectedToken ||
								!amount ||
								Number.parseFloat(amount) <= 0 ||
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
