"use client";
import { Button } from "@dexion/ui/components/ui/button";
import { Input } from "@dexion/ui/components/ui/input";
import { Bell, Search, Wallet2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { WatchlistCredenza } from "~/components/watchlist/watchlist-credenza";
import { useSession } from "~/contexts/AuthClientContext";
import { Session } from "~/types/auth";
import { AccountDropdown } from "./account/account-management";
import { SearchDialog } from "./search-dialog";
import Balance from "./wallet/balance";

const DISABLE_EXTRA_LINKS = true;

const navLinks = [
	{ label: "Discover", href: "#", disabled: DISABLE_EXTRA_LINKS },
	{ label: "Pulse", href: "#", disabled: DISABLE_EXTRA_LINKS },
	{ label: "Trackers", href: "/trackers", disabled: false },
	{ label: "Perpetuals", href: "#", disabled: DISABLE_EXTRA_LINKS },
	{ label: "Yield", href: "#", disabled: DISABLE_EXTRA_LINKS },
	{ label: "Portfolio", href: "#", disabled: DISABLE_EXTRA_LINKS },
	{ label: "Alerts", href: "/alerts", disabled: false },
];

export default function SiteHeader() {
	const { data, isPending } = useSession();

	return (
		<header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4">
			<div className="flex items-center gap-1 sm:gap-6">
				<Link href="/" className="flex items-center gap-2 font-bold">
					<div className="flex items-center ">
						<Image
							src="/branding/logo-light.png"
							alt="Company Logo"
							width={50}
							height={40}
							className="h-auto w-auto -ml-5"
							priority
						/>
						<span className="-ml-3 text-blue-400">Pro</span>
					</div>
				</Link>
				<nav className="hidden md:flex">
					<ul className="flex items-center gap-4">
						{navLinks.map((link) => (
							<li key={link.label}>
								<NavLink
									href={link.href}
									className={"text-sm"}
									disabled={link.disabled}
								>
									{link.label}
								</NavLink>
							</li>
						))}
					</ul>
				</nav>
				<nav className="md:hidden">
					<ul className="flex items-center gap-2">
						<li>
							<NavLink href="/alerts" className={"text-sm"} disabled={false}>
								Alerts
							</NavLink>
						</li>
						<li>
							<NavLink href="/trackers" className={"text-sm"} disabled={false}>
								Trackers
							</NavLink>
						</li>
					</ul>
				</nav>
			</div>
			<div className="flex items-center gap-0 lg:gap-3">
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

				<Balance session={data as Session} isSessionPending={isPending}>
					<Button variant="ghost" size="icon" className="rounded-full">
						<Wallet2 className="h-5 w-5" />
					</Button>
				</Balance>
				<Button variant="ghost" size="icon" className="rounded-full" disabled>
					<Bell className="h-5 w-5" />
				</Button>
				<AccountDropdown session={data as Session} />
			</div>
		</header>
	);
}

type NavLinkProps = {
	className?: string;
	children: ReactNode;
	href: string;
	disabled: boolean;
};
const NavLink = ({
	href,
	children,
	className,
	disabled = false,
}: NavLinkProps) => {
	if (disabled) {
		return (
			<span className={`${className} opacity-40 cursor-not-allowed`}>
				{children}
			</span>
		);
	}
	return (
		<Link href={href} className={className}>
			{children}
		</Link>
	);
};
