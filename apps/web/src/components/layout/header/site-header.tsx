"use client";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Bell, Search, Wallet2 } from "lucide-react";
import Link from "next/link";
import AuthController from "~/components/auth/auth-controller";
import { WatchlistCredenza } from "~/components/watchlist/watchlist-credenza";
import siteConfig from "~/config/site";
import { authClient } from "~/lib/auth-client";
import { sendStxWithTurnKey } from "~/lib/turnkey/signing";
import { AccountPopover } from "./account/account-management";
import { SearchDialog } from "./search-dialog";
import Balance from "./wallet/balance";

export default function SiteHeader() {
	const { data } = authClient.useSession();
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
						<AuthController />
					</ul>
				</nav>
			</div>
			<div className="flex items-center gap-4">
				<SearchDialog
					trigger={
						<div className="relative md:block">
							<Search className="sm:absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="search"
								placeholder="Search by token or CA..."
								className="w-64 rounded-full bg-muted pl-8 text-xs hidden sm:flex"
							/>
						</div>
					}
				/>
				<WatchlistCredenza />

				<Button
					variant="secondary"
					size="sm"
					className="rounded-full"
					onClick={async () => {
						const user = data?.user;
						if (
							user?.walletPublicKey &&
							user.walletAddress &&
							user.subOrganizationId
						) {
							await sendStxWithTurnKey(
								user?.walletPublicKey as string,
								user?.walletAddress as string,
								"SPQ9B3SYFV0AFYY96QN5ZJBNGCRRZCCMFHY0M34Z",
								user?.subOrganizationId,
							);
						}
					}}
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
