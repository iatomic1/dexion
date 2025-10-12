"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/ui/dialog";
import {
	ArrowDownRight,
	ArrowUpRight,
	Copy,
	ExternalLink,
	LogOut,
	Send,
} from "lucide-react";
import { useState } from "react";

interface WalletModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
	const [copied, setCopied] = useState(false);
	const walletAddress = "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7";

	const handleCopy = () => {
		navigator.clipboard.writeText(walletAddress);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="glass-panel border-border bg-background/95 backdrop-blur-xl">
				<DialogHeader>
					<DialogTitle className="text-foreground">Wallet</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Manage your embedded wallet powered by Turnkey
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Wallet Address */}
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">Wallet Address</p>
						<div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border">
							<p className="text-sm font-mono text-foreground flex-1 truncate">
								{walletAddress}
							</p>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 shrink-0"
								onClick={handleCopy}
							>
								<Copy className="w-4 h-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 shrink-0"
								asChild
							>
								<a
									href={`https://explorer.stacks.co/address/${walletAddress}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									<ExternalLink className="w-4 h-4" />
								</a>
							</Button>
						</div>
						{copied && (
							<p className="text-xs text-green-400">Copied to clipboard!</p>
						)}
					</div>

					{/* Balance */}
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">Current Balance</p>
						<div className="p-4 rounded-lg bg-secondary/50 border border-border">
							<p className="text-3xl font-bold text-foreground">2.45 sBTC</p>
							<p className="text-sm text-muted-foreground mt-1">
								≈ $98,670.25 USD
							</p>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">Quick Actions</p>
						<div className="grid grid-cols-3 gap-2">
							<Button
								variant="outline"
								className="flex flex-col gap-2 h-auto py-4 glass-panel border-border bg-transparent"
							>
								<ArrowDownRight className="w-5 h-5" />
								<span className="text-xs">Deposit</span>
							</Button>
							<Button
								variant="outline"
								className="flex flex-col gap-2 h-auto py-4 glass-panel border-border bg-transparent"
							>
								<ArrowUpRight className="w-5 h-5" />
								<span className="text-xs">Withdraw</span>
							</Button>
							<Button
								variant="outline"
								className="flex flex-col gap-2 h-auto py-4 glass-panel border-border bg-transparent"
								onClick={() => {
									onOpenChange(false);
									window.location.href = "/transfer";
								}}
							>
								<Send className="w-5 h-5" />
								<span className="text-xs">Transfer</span>
							</Button>
						</div>
					</div>

					{/* Disconnect */}
					<Button
						variant="destructive"
						className="w-full"
						onClick={() => {
							// TODO: Implement disconnect logic
							window.location.href = "/";
						}}
					>
						<LogOut className="w-4 h-4 mr-2" />
						Disconnect Wallet
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
