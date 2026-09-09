"use client";

import { cn } from "@dexion/ui/lib/utils";
import { Activity, Bell, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
	{ label: "DISCOVER", href: "#", Icon: Search },
	{ label: "PULSE", href: "#", Icon: Activity },
	{ label: "ALERTS", href: "/alerts", Icon: Bell },
	{ label: "ACCOUNT", href: "/settings", Icon: UserRound },
] as const;

export default function MobileBottomNav() {
	const pathname = usePathname();

	return (
		<nav className="fixed inset-x-0 bottom-0 z-20 flex border-t-2 border-dx-line-strong bg-dx-bg sm:hidden">
			{TABS.map(({ label, href, Icon }) => {
				const isPlaceholder = href === "#";
				const active =
					!isPlaceholder &&
					(pathname.startsWith(href) ||
						(href === "/alerts" && pathname.startsWith("/trackers")));

				return (
					<Link
						key={label}
						href={href}
						onClick={(e) => {
							if (isPlaceholder) e.preventDefault();
						}}
						className={cn(
							"flex flex-1 flex-col items-center gap-1.5 border-r border-dx-line pt-3 pb-[18px] last:border-r-0",
							active
								? "-mt-0.5 border-t-2 border-t-dx-green bg-dx-panel text-dx-green"
								: "text-dx-faint",
						)}
					>
						<Icon className="size-[19px]" strokeWidth={1.8} />
						<span className="font-mono text-[9px] tracking-[.12em]">
							{label}
						</span>
					</Link>
				);
			})}
		</nav>
	);
}
