"use client";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Bell, Search, Wallet2 } from "lucide-react";
import Link from "next/link";
import { WatchlistCredenza } from "~/components/watchlist/watchlist-credenza";
import siteConfig from "~/config/site";
import { useSession } from "~/contexts/AuthClientContext";
import { AccountPopover } from "./account/account-management";
import { SearchDialog } from "./search-dialog";
import Balance from "./wallet/balance";

export default function SiteHeader() {
	const { data, isPending } = useSession();

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
								href="/trackers"
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
			<div className="flex items-center gap-2 lg:gap-3">
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

				{/* <Button
					variant="secondary"
					size="sm"
					className="rounded-full"
					onClick={handleTokenTransfer}
				>
					Test Send
				</Button> */}

				<Balance session={data} isSessionPending={isPending}>
					<Button variant="ghost" size="icon" className="rounded-full">
						<Wallet2 className="h-5 w-5" />
					</Button>
				</Balance>
				<Button variant="ghost" size="icon" className="rounded-full">
					<Bell className="h-5 w-5" />
				</Button>
				<AccountPopover session={data} />
			</div>
		</header>
	);
}
