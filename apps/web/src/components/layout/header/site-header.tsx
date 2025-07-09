"use client";
import { SignerError, SigningError } from "@repo/signer";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { ValidationError } from "@stacks/common";
import type { TxBroadcastResultOk } from "@stacks/transactions";
import { Bell, Search, Wallet2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";
import AuthController from "~/components/auth/auth-controller";
import { WatchlistCredenza } from "~/components/watchlist/watchlist-credenza";
import siteConfig from "~/config/site";
import { transferStx } from "~/lib/signer/actions";
import { AccountPopover } from "./account/account-management";
import { SearchDialog } from "./search-dialog";
import Balance from "./wallet/balance";

export default function SiteHeader() {
	const { isPending, execute, data, error, isError } =
		useServerAction(transferStx);

	const handleTokenTransfer = async () => {
		// Create the promise for the token transfer
		const transferPromise = execute({
			amount: 100,
			recipient: "SPQ9B3SYFV0AFYY96QN5ZJBNGCRRZCCMFHY0M34Z",
		});

		// Use toast.promise to handle the async operation
		toast.promise(transferPromise, {
			loading: "Signing and broadcasting transaction...",
			success: (result) => {
				const txRes = result[0];
				console.log(txRes);
				if (txRes?.success) {
					return `Transaction successful! TX ID: ${txRes.txid?.slice(0, 8)}...`;
				}
			},
			error: (error) => {
				console.error("Transaction failed:", error);

				// Handle different error types with specific messages
				if (error instanceof ValidationError) {
					return `Invalid input: ${error.message}`;
				}

				if (error instanceof SigningError) {
					return `Signing failed: ${error.message}`;
				}

				if (error instanceof SignerError) {
					switch (error.code) {
						case "SIGNER_INIT_ERROR":
							return "Failed to initialize signer. Please check your wallet connection.";
						case "BROADCAST_ERROR":
							return "Failed to broadcast transaction. Please try again.";
						case "TURNKEY_ERROR":
							return "Wallet provider error. Please check your connection.";
						default:
							return `Transaction failed: ${error.message}`;
					}
				}

				// Generic error fallback
				return `Transaction failed: ${error instanceof Error ? error.message : String(error)}`;
			},
		});
	};

	return (
		<header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4">
			<div className="flex items-center gap-6">
				<Link href="/" className="flex items-center gap-2 font-bold">
					<div className="flex items-center">
						<div className="h-6 w-6 bg-primary clip-triangle" />
						<span className="ml-2 text-blue-400">{siteConfig.title} Pro</span>
					</div>
				</Link>
				<nav className="hidden md:flex">
					<ul className="flex items-center gap-4">
						<li>
							<Link
								href="#"
								className="text-sm text-muted-foreground hover:text-foreground"
							>
								Discover
							</Link>
						</li>
						<li>
							<Link
								href="#"
								className="text-sm text-muted-foreground hover:text-foreground"
							>
								Pulse
							</Link>
						</li>
						<li>
							<Link
								href="#"
								className="text-sm text-muted-foreground hover:text-foreground"
							>
								Trackers
							</Link>
						</li>
						<li>
							<Link
								href="#"
								className="text-sm text-muted-foreground hover:text-foreground"
							>
								Perpetuals
							</Link>
						</li>
						<li>
							<Link
								href="#"
								className="text-sm text-muted-foreground hover:text-foreground"
							>
								Yield
							</Link>
						</li>
						<li>
							<Link
								href="#"
								className="text-sm text-primary hover:text-primary/90"
							>
								Portfolio
							</Link>
						</li>
						<li>
							<Link
								href="#"
								className="text-sm text-muted-foreground hover:text-foreground"
							>
								Rewards
							</Link>
						</li>
						{/* <AuthController /> */}
					</ul>
				</nav>
			</div>
			<div className="flex items-center gap-2 lg:gap-4">
				<SearchDialog
					trigger={
						<div className="relative md:block">
							<Search className="lg:absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="search"
								placeholder="Search by token or CA..."
								className="w-64 rounded-full bg-muted pl-8 text-xs hidden lg:flex"
							/>
						</div>
					}
				/>
				<WatchlistCredenza />

				<Button
					variant="secondary"
					size="sm"
					className="rounded-full"
					onClick={handleTokenTransfer}
				>
					Test Send
				</Button>

				<Balance>
					<Button variant="ghost" size="icon" className="rounded-full">
						<Wallet2 className="h-5 w-5" />
					</Button>
				</Balance>
				<Button variant="ghost" size="icon" className="rounded-full">
					<Bell className="h-5 w-5" />
				</Button>
				<AccountPopover />
			</div>
		</header>
	);
}
