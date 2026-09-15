"use client";
import { cn } from "@dexion/ui/lib/utils";
import { Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "~/contexts/AuthClientContext";
import type { Session } from "~/types/auth";
import { AccountDropdown } from "./account/account-management";

// One-line flip when Perpetuals/Yield/Portfolio ship.
const SHOW_SOON_CELL = true;

const navLinks = [
	{ label: "Discover", href: "#" },
	{ label: "Pulse", href: "#" },
	{ label: "Trackers", href: "/trackers" },
	{ label: "Alerts", href: "/alerts" },
];

const soonLinks = ["Perpetuals", "Yield", "Portfolio"];

export default function SiteHeader() {
	const { data } = useSession();
	const pathname = usePathname();
	const address = (data as Session)?.user?.externalAddress ?? null;

	return (
		<>
			<header className="sticky top-0 z-20 hidden h-[53px] items-stretch border-b-2 border-dx-line-strong bg-dx-bg sm:flex">
				<Link
					href="/"
					className="flex flex-none items-center gap-2.5 border-r border-dx-line px-[22px]"
				>
					<Image
						src="/branding/logo-light.png"
						alt="Dexion"
						width={26}
						height={26}
						className="size-[26px] object-contain"
						priority
					/>
					<span className="font-bold text-[16px] text-dx-ink tracking-[-.02em]">
						DEXION
					</span>
					<span className="border border-dx-green/40 px-[5px] py-[2px] font-mono text-[10px] text-dx-green tracking-[.14em]">
						PRO
					</span>
				</Link>

				<nav className="flex min-w-0 flex-1 items-stretch overflow-x-auto">
					{navLinks.map((link) => {
						const isPlaceholder = link.href === "#";
						const active = !isPlaceholder && pathname.startsWith(link.href);
						return (
							<Link
								key={link.label}
								href={link.href}
								onClick={(e) => {
									if (isPlaceholder) e.preventDefault();
								}}
								className={cn(
									"flex items-center whitespace-nowrap border-r border-b-2 border-dx-line px-[18px] text-[14px] font-medium transition-colors duration-150",
									active
										? "border-b-dx-green bg-dx-panel font-semibold text-dx-ink"
										: "border-b-transparent text-dx-dim hover:bg-dx-panel hover:text-dx-ink",
								)}
							>
								{link.label}
							</Link>
						);
					})}
					{SHOW_SOON_CELL && (
						<div className="hidden items-center gap-4 whitespace-nowrap border-r border-dx-line px-[18px] min-[1070px]:flex">
							<span className="border border-dx-line px-[5px] py-[3px] font-mono text-[9px] text-dx-faint tracking-[.16em]">
								SOON
							</span>
							{soonLinks.map((label) => (
								<span
									key={label}
									className="cursor-not-allowed text-[14px] text-[#464c47]"
								>
									{label}
								</span>
							))}
						</div>
					)}
				</nav>

				<div className="ml-auto flex flex-none items-stretch">
					<div
						title="Notifications — coming soon"
						aria-label="Notifications — coming soon"
						aria-disabled="true"
						tabIndex={-1}
						className="flex w-[52px] cursor-not-allowed items-center justify-center border-l border-dx-line opacity-35"
					>
						<Bell className="size-[17px] text-dx-dim" strokeWidth={1.8} />
					</div>
					<AccountDropdown session={data as Session} />
				</div>
			</header>

			<header className="sticky top-0 z-20 flex h-[53px] items-center gap-2.5 border-b-2 border-dx-line-strong bg-dx-bg px-[18px] sm:hidden">
				<Link href="/" className="flex flex-none items-center gap-2.5">
					<Image
						src="/branding/logo-light.png"
						alt="Dexion"
						width={24}
						height={24}
						className="size-6 object-contain"
						priority
					/>
					<span className="font-bold text-[15px] text-dx-ink tracking-[-.02em]">
						DEXION
					</span>
					<span className="border border-dx-green/40 px-[5px] py-[2px] font-mono text-[9px] text-dx-green tracking-[.14em]">
						PRO
					</span>
				</Link>
				<div className="flex-1" />
				<Link
					href="/settings"
					aria-label="Account"
					className="flex size-8 flex-none items-center justify-center border border-dx-line-strong bg-dx-panel-2 font-mono text-[11px] text-dx-green"
				>
					{address ? address.slice(0, 2).toUpperCase() : "SP"}
				</Link>
			</header>
		</>
	);
}
