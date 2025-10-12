"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Bell, Menu, Settings, Wallet, Wallet2 } from "lucide-react";
import Link from "next/link";
import Balance from "~/components/layout/header/wallet/balance";
import siteConfig from "~/config/site";
import { useSession } from "~/contexts/AuthClientContext";

interface DashboardNavProps {
	onWalletClick: () => void;
	onMenuClick: () => void;
}

const sbtcTokenConfig = {
	symbol: "btc",
	displayName: "sBTC",
	decimals: 8,
	icon: "/icons/sbtc.png",
	contractId:
		"SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token",
};

export function DashboardNav({
	onWalletClick,
	onMenuClick,
}: DashboardNavProps) {
	const { data, isPending } = useSession();

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border glass-panel">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<div className="flex items-center gap-8">
					<Link href="/dashboard" className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
							<span className="text-lg font-bold text-primary-foreground">
								S
							</span>
						</div>
						<span className="text-xl font-bold text-foreground hidden sm:inline">
							{siteConfig.title} | sBTC
						</span>
					</Link>

					<nav className="hidden md:flex items-center gap-6">
						<Link
							href="/dashboard"
							className="text-sm font-medium text-foreground hover:text-primary transition-colors"
						>
							Dashboard
						</Link>
						<Link
							href="/granite"
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
						>
							Granite
						</Link>
						<Link
							href="/zest"
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
						>
							Zest
						</Link>
						<Link
							href="/stacking"
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
						>
							StackingDAO
						</Link>
						<Link
							href="/history"
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
						>
							History
						</Link>
					</nav>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="relative hover:bg-secondary"
						disabled
					>
						<Bell className="w-5 h-5 text-foreground" />
						<Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs">
							2
						</Badge>
					</Button>

					<Button
						variant="ghost"
						size="icon"
						className="hover:bg-secondary"
						asChild
					>
						<Link href="/settings">
							<Settings className="w-5 h-5 text-foreground" />
						</Link>
					</Button>

					<Balance
						session={data}
						isSessionPending={isPending}
						tokenConfig={sbtcTokenConfig}
					>
						<Button variant="ghost" size="icon" className="rounded-full">
							<Wallet2 className="h-5 w-5" />
						</Button>
					</Balance>
					{/*<Button
            variant="outline"
            size="sm"
            className="glass-panel border-border hidden sm:flex bg-transparent"
            onClick={onWalletClick}
          >
            <Wallet className="w-4 h-4 mr-2" />
            <span className="font-mono">SP2J6...7K3M</span>
          </Button>*/}

					<Button
						variant="ghost"
						size="icon"
						className="md:hidden hover:bg-secondary"
						onClick={onMenuClick}
					>
						<Menu className="w-5 h-5 text-foreground" />
					</Button>
				</div>
			</div>
		</header>
	);
}
