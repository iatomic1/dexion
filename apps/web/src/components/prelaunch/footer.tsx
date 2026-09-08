import { SiDiscord, SiX } from "@icons-pack/react-simple-icons";
import { BookOpen } from "lucide-react";
import Image from "next/image";
import ThemeSwitcherTab from "~/components/layout/site-footer/theme-switcher";
import siteConfig from "~/config/site";
import { Container, FOCUS_RING } from "./ui";

const LINKS = [
	{ label: "Privacy", href: "/privacy" },
	{ label: "Terms", href: "/terms" },
];

const SOCIAL_LINKS = [
	{ label: "Discord", href: siteConfig.socials.DISCORD, icon: SiDiscord },
	{ label: "X", href: siteConfig.socials.X, icon: SiX },
	{ label: "Docs", href: siteConfig.socials.DOCS, icon: BookOpen },
];

function SocialRow({ className = "" }: { className?: string }) {
	return (
		<div className={`flex items-center gap-2.5 ${className}`}>
			{SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
				<a
					key={label}
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={label}
					className={`flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,255,255,.09)] bg-[rgba(255,255,255,.03)] text-[#8a918b] transition-colors hover:bg-[rgba(255,255,255,.07)] hover:text-[#e9ece9] ${FOCUS_RING}`}
				>
					<Icon size={15} />
				</a>
			))}
		</div>
	);
}

function LogoRow() {
	return (
		<div className="flex items-center gap-2.5">
			<Image
				src="/logo.png"
				alt="Dexion"
				width={48}
				height={48}
				className="h-[22px] w-[22px] rounded-[6px]"
			/>
			<span className="text-[15px] font-semibold text-[#e9ece9]">
				Dexion Pro
			</span>
		</div>
	);
}

function LinkRow({ className = "" }: { className?: string }) {
	return (
		<div className={`flex flex-wrap gap-[18px] ${className}`}>
			{LINKS.map((link) => (
				<a
					key={link.label}
					href={link.href}
					className={`text-[#8a918b] transition-colors hover:text-[#e9ece9] ${FOCUS_RING}`}
				>
					{link.label}
				</a>
			))}
		</div>
	);
}

export function PrelaunchFooter() {
	return (
		<footer className="border-t border-[rgba(255,255,255,.06)] bg-black">
			<Container className="py-[22px]">
				{/* Mobile: stacked, logo row / socials / links row / theme / copyright */}
				<div className="flex flex-col gap-3.5 sm:hidden">
					<LogoRow />
					<SocialRow />
					<div className="flex flex-wrap items-center justify-between gap-3">
						<LinkRow className="text-[12px]" />
						<ThemeSwitcherTab />
					</div>
					<span className="font-mono text-[10px] text-[#5c635e]">
						© 2026 Dexion. All rights reserved.
					</span>
				</div>

				{/* Desktop: left (logo + copyright) / right (socials + links + theme) */}
				<div className="hidden flex-wrap items-center justify-between gap-4 sm:flex">
					<div className="flex flex-col gap-1.5">
						<LogoRow />
						<span className="font-mono text-[12px] text-[#5c635e]">
							© 2026 Dexion. All rights reserved.
						</span>
					</div>
					<div className="flex flex-wrap items-center gap-6">
						<SocialRow />
						<LinkRow className="text-[13px]" />
						<ThemeSwitcherTab />
					</div>
				</div>
			</Container>
		</footer>
	);
}
