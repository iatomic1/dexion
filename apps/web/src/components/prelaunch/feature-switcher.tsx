"use client";

import {
	BarChart3,
	Bell,
	CreditCard,
	LineChart,
	Link as LinkIcon,
	type LucideIcon,
	Send,
} from "lucide-react";
import { useState } from "react";
import { Container, IconChip, SectionHeader } from "./ui";

const FEATURE_CARDS: {
	icon: LucideIcon;
	title: string;
	body: string;
	chips?: string[];
}[] = [
	{
		icon: LineChart,
		title: "Price Tracking",
		body: "Track supported tokens in real time with a clean dashboard.",
	},
	{
		icon: Bell,
		title: "Smart Alerts",
		body: "Configure custom price and market condition alerts.",
	},
	{
		icon: Send,
		title: "Instant Notifications",
		body: "Alerts delivered where you already are.",
		chips: ["TELEGRAM", "EMAIL", "BROWSER", "WEBHOOKS"],
	},
	{
		icon: LinkIcon,
		title: "Developer Friendly",
		body: "Automate workflows using webhook integrations.",
	},
];

function FeatureGrid() {
	return (
		<div className="hidden grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-[clamp(12px,1.6vw,18px)] sm:grid sm:mb-[clamp(28px,3.4vw,44px)]">
			{FEATURE_CARDS.map((card) => (
				<div
					key={card.title}
					className="group flex flex-col gap-[11px] rounded-[14px] border border-[rgba(255,255,255,.07)] bg-[#0a0c0b] p-6 transition-[transform,background-color,border-color] duration-200 hover:-translate-y-[3px] hover:border-[rgba(62,207,142,.32)] hover:bg-[#0c100e]"
				>
					<IconChip icon={card.icon} size={36} radius={10} iconSize={17} />
					<span className="text-[16px] font-semibold text-[#e9ece9]">
						{card.title}
					</span>
					<p className="text-[14px] leading-[1.55] text-[#7a827c]">
						{card.body}
					</p>
					{card.chips ? (
						<div className="flex flex-wrap gap-2">
							{card.chips.map((chip) => (
								<span
									key={chip}
									className="rounded-full border border-[rgba(255,255,255,.1)] px-[11px] py-1.5 font-mono text-[10px] uppercase tracking-[.1em] text-[#a4aca5]"
								>
									{chip}
								</span>
							))}
						</div>
					) : null}
				</div>
			))}
		</div>
	);
}

type Badge = { label: string; tone: "accent" | "neutral" };

type TabConfig = {
	title: string;
	subtitle: string;
	chip: string;
	leadIcon: LucideIcon;
	headline: string;
	badge?: Badge;
	paragraph: string;
	rows: string[];
	right: React.ReactNode;
};

function BadgeTag({ badge }: { badge: Badge }) {
	const tone =
		badge.tone === "accent"
			? "bg-[rgba(62,207,142,.14)] text-[#7de6b3]"
			: "bg-[rgba(255,255,255,.06)] text-[#9aa29b]";
	return (
		<span
			className={`rounded-full px-2 py-1 font-mono text-[10px] uppercase tracking-[.14em] ${tone}`}
		>
			{badge.label}
		</span>
	);
}

function MockShell({ children }: { children: React.ReactNode }) {
	return (
		<div
			className="w-full max-w-[320px] rounded-[12px] border border-[rgba(255,255,255,.08)] bg-[rgba(4,6,5,.9)] p-4"
			aria-hidden="true"
		>
			{children}
		</div>
	);
}

function WatchlistMock() {
	const rows = [
		{ label: "STX / $1.842", delta: "+4.21%", up: true },
		{ label: "sBTC / $64,120", delta: "+0.94%", up: true },
		{ label: "ALEX / $0.0614", delta: "−1.08%", up: false },
	];
	return (
		<MockShell>
			<div className="flex items-center justify-between border-b border-[rgba(255,255,255,.06)] pb-3">
				<span className="text-[13px] font-semibold text-[#e9ece9]">
					Watchlist
				</span>
				<span className="font-mono text-[11px] text-[#3ecf8e]">2s</span>
			</div>
			{rows.map((row) => (
				<div
					key={row.label}
					className="flex items-center justify-between border-t border-[rgba(255,255,255,.04)] py-2.5 text-[12px]"
				>
					<span className="text-[#cfd6d0]">{row.label}</span>
					<span
						className={`font-mono ${row.up ? "text-[#3ecf8e]" : "text-[#e0705c]"}`}
					>
						{row.delta}
					</span>
				</div>
			))}
		</MockShell>
	);
}

function WalletsMock() {
	const rows = [
		{ label: "SP2J…8QK4 → +12.4k STX", tone: "text-[#3ecf8e]" },
		{ label: "SP1AB…M20X → −3.1k ALEX", tone: "text-[#e0705c]" },
		{ label: "SP3RT…7F9C → swap · sBTC", tone: "text-[#8a918b]" },
	];
	return (
		<MockShell>
			<div className="flex items-center justify-between border-b border-[rgba(255,255,255,.06)] pb-3">
				<span className="text-[13px] font-semibold text-[#e9ece9]">
					Tracked wallets
				</span>
				<span className="font-mono text-[11px] text-[#8a918b]">3 / 300</span>
			</div>
			{rows.map((row) => (
				<div
					key={row.label}
					className={`border-t border-[rgba(255,255,255,.04)] py-2.5 font-mono text-[11px] ${row.tone}`}
				>
					{row.label}
				</div>
			))}
		</MockShell>
	);
}

function AlertsMock() {
	const rows = [
		{
			title: "STX crossed $1.90",
			sub: "Telegram · Email · Browser",
			time: "0.8s",
			tint: true,
		},
		{ title: "ALEX below $0.058", sub: "Email digest", time: "1m" },
		{ title: "Pool TVL passed $10M", sub: "Browser push", time: "4m" },
	];
	return (
		<div
			className="flex w-full max-w-[320px] flex-col gap-2"
			aria-hidden="true"
		>
			{rows.map((row) => (
				<div
					key={row.title}
					className={`rounded-[12px] border px-4 py-3 ${
						row.tint
							? "border-[rgba(62,207,142,.22)] bg-[rgba(62,207,142,.07)]"
							: "border-[rgba(255,255,255,.08)] bg-[rgba(4,6,5,.9)]"
					}`}
				>
					<div className="flex items-center justify-between">
						<span className="text-[14px] font-semibold text-[#e9ece9]">
							{row.title}
						</span>
						<span className="font-mono text-[11px] text-[#6f766f]">
							{row.time}
						</span>
					</div>
					<p className="mt-1 text-[12px] text-[#8a918b]">{row.sub}</p>
				</div>
			))}
		</div>
	);
}

const BIN_HEIGHTS = [26, 40, 58, 82, 64, 44, 30, 20];
const ACTIVE_BIN_INDEX = BIN_HEIGHTS.indexOf(Math.max(...BIN_HEIGHTS));

function HodlmmMock() {
	return (
		<MockShell>
			<div className="flex items-center justify-between border-b border-[rgba(255,255,255,.06)] pb-3">
				<span className="text-[13px] font-semibold text-[#e9ece9]">
					HodlMM positions
				</span>
				<span className="font-mono text-[11px] text-[#8a918b]">BITFLOW</span>
			</div>
			<div className="flex items-end gap-[3px] pt-4" style={{ height: 66 }}>
				{BIN_HEIGHTS.map((h, i) => {
					const isActive = i === ACTIVE_BIN_INDEX;
					const isShoulder = Math.abs(i - ACTIVE_BIN_INDEX) === 1;
					return (
						<div
							key={`bin-${i}-${h}`}
							className="flex-1 rounded-t-[2px]"
							style={{
								height: `${h}%`,
								background: isActive
									? "#3ecf8e"
									: isShoulder
										? "rgba(62,207,142,.35)"
										: "rgba(255,255,255,.07)",
								boxShadow: isActive
									? "0 0 14px rgba(62,207,142,.5)"
									: undefined,
							}}
						/>
					);
				})}
			</div>
			<div className="flex items-center justify-between pt-2 font-mono text-[10px] uppercase tracking-[.12em]">
				<span className="text-[#5c635e]">Price bins</span>
				<span className="text-[#3ecf8e]">Active bin</span>
			</div>
			<div className="mt-3 flex flex-col gap-2">
				<div className="flex items-center justify-between border-t border-[rgba(255,255,255,.04)] pt-2.5 text-[12px] text-[#cfd6d0]">
					<span>STX / sBTC</span>
					<span className="rounded-full bg-[rgba(62,207,142,.14)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.1em] text-[#7de6b3]">
						In range
					</span>
				</div>
				<div className="flex items-center justify-between border-t border-[rgba(255,255,255,.04)] pt-2.5 text-[12px] text-[#cfd6d0]">
					<span>STX / ALEX</span>
					<span className="rounded-full bg-[rgba(224,112,92,.14)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.1em] text-[#f0a294]">
						Out of range
					</span>
				</div>
			</div>
		</MockShell>
	);
}

function TerminalMock() {
	return (
		<MockShell>
			<div className="flex items-center gap-1.5 border-b border-[rgba(255,255,255,.06)] pb-3">
				<span className="h-2 w-2 rounded-full bg-[rgba(255,255,255,.14)]" />
				<span className="h-2 w-2 rounded-full bg-[rgba(255,255,255,.14)]" />
				<span className="h-2 w-2 rounded-full bg-[rgba(62,207,142,.5)]" />
				<span className="ml-2 font-mono text-[11px] text-[#8a918b]">
					POST /your-endpoint
				</span>
			</div>
			<pre className="overflow-x-auto pt-3 font-mono text-[12px] leading-[1.6]">
				<span className="text-[#e9ece9]">{"{ "}</span>
				<span className="text-[#7de6b3]">"event"</span>
				<span className="text-[#e9ece9]">: </span>
				<span className="text-[#e8c07d]">"price.threshold.crossed"</span>
				<span className="text-[#e9ece9]">, </span>
				<span className="text-[#7de6b3]">"token"</span>
				<span className="text-[#e9ece9]">: </span>
				<span className="text-[#e8c07d]">"STX"</span>
				<span className="text-[#e9ece9]">, </span>
				<span className="text-[#7de6b3]">"price"</span>
				<span className="text-[#e9ece9]">: </span>
				<span className="text-[#e9ece9]">1.9042</span>
				<span className="text-[#e9ece9]">{" }"}</span>
			</pre>
		</MockShell>
	);
}

const TABS: TabConfig[] = [
	{
		title: "Price Tracking",
		subtitle: "Live prices, zero refresh.",
		chip: "Prices",
		leadIcon: LineChart,
		headline: "Updates in under 2 seconds",
		paragraph:
			"Cross-DEX pricing aggregated across the Stacks ecosystem, so the number you see is the number you trade on.",
		rows: [
			"Modular token tracking",
			"Watchlists and 24h movement",
			"Memo / CA token pages",
		],
		right: <WatchlistMock />,
	},
	{
		title: "Wallet Tracking",
		subtitle: "Follow the smart money.",
		chip: "Wallets",
		leadIcon: CreditCard,
		headline: "Track up to 300 wallets",
		badge: { label: "IN BETA", tone: "neutral" },
		paragraph:
			"Watch the addresses that move markets and get alerted the moment they act. Rolling out to beta users as it hardens.",
		rows: [
			"Activity feed per address",
			"Alerts on wallet moves",
			"Labels and grouping",
		],
		right: <WalletsMock />,
	},
	{
		title: "Smart Alerts",
		subtitle: "Only what matters.",
		chip: "Alerts",
		leadIcon: Bell,
		headline: "Set the rule once",
		paragraph:
			"Price above or below a target, a TVL milestone, or a threshold of your own — delivered to Telegram, email, browser or webhook.",
		rows: ["Price above / below target", "TVL milestones", "Custom thresholds"],
		right: <AlertsMock />,
	},
	{
		title: "HodlMM Alerts",
		subtitle: "Never LP out of range.",
		chip: "HodlMM",
		leadIcon: BarChart3,
		headline: "Know the moment you fall out of range",
		badge: { label: "LIVE", tone: "accent" },
		paragraph:
			"Bitflow's HodlMM concentrates your liquidity in discrete price bins — earning fees only while the market price sits inside your range. Drift outside it and the position quietly earns nothing.",
		rows: [
			"Positions auto-discovered from your wallet",
			"In-range ↔ out-of-range flip detection",
			"Rebalance prompts via Telegram, email or webhook",
		],
		right: <HodlmmMock />,
	},
	{
		title: "Automation",
		subtitle: "Webhooks and workflows.",
		chip: "Automation",
		leadIcon: LinkIcon,
		headline: "Webhook-first architecture",
		paragraph:
			"Signed payloads with retries, so market events can drive your own bots, sheets and internal tooling.",
		rows: [
			"Automation-ready events",
			"Flexible architecture",
			"Custom workflows",
		],
		right: <TerminalMock />,
	},
];

export function PrelaunchFeatureSwitcher() {
	const [tab, setTab] = useState(0);
	const active = TABS[tab];

	return (
		<section
			id="features"
			className="border-t border-[rgba(255,255,255,.05)] py-[clamp(56px,7vw,104px)]"
		>
			<Container className="flex flex-col gap-8">
				<SectionHeader
					title={
						<>
							Everything you need,
							<br />
							already shipping.
						</>
					}
					sub="Price tracking, smart alerts, four notification channels and webhooks — all live in beta."
				/>

				<FeatureGrid />

				<div
					role="tablist"
					aria-label="Feature categories"
					className="hidden border-b border-[rgba(255,255,255,.08)] sm:grid sm:grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))]"
				>
					{TABS.map((t, i) => (
						<button
							key={t.title}
							type="button"
							role="tab"
							aria-selected={tab === i}
							onClick={() => setTab(i)}
							className={`-mb-px border-b-2 px-[18px] pb-4 pt-[18px] text-left transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3ecf8e] ${
								tab === i
									? "border-[#3ecf8e] text-[#e9ece9]"
									: "border-transparent text-[#8a918b] hover:text-[#e9ece9]"
							}`}
						>
							<div className="text-[15px] font-semibold">{t.title}</div>
							<div className="text-[13px] text-[#6f766f]">{t.subtitle}</div>
						</button>
					))}
				</div>

				<div className="scrollbar-hide -mx-[22px] flex gap-[7px] overflow-x-auto px-[22px] sm:hidden">
					{TABS.map((t, i) => (
						<button
							key={t.title}
							type="button"
							role="tab"
							aria-selected={tab === i}
							onClick={() => setTab(i)}
							className={`shrink-0 whitespace-nowrap rounded-full px-[15px] py-[9px] text-[13px] font-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3ecf8e] ${
								tab === i
									? "bg-[#3ecf8e] text-[#04150d]"
									: "border border-[rgba(255,255,255,.08)] bg-[rgba(255,255,255,.04)] text-[#8a918b]"
							}`}
						>
							{t.chip}
						</button>
					))}
				</div>

				<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] overflow-hidden rounded-[14px] border border-[rgba(255,255,255,.07)] bg-[#0a0c0b]">
					<div className="flex flex-col gap-6 border-b border-[rgba(255,255,255,.07)] p-[clamp(20px,2.4vw,28px)] sm:border-b-0 sm:border-r">
						<div className="flex flex-col gap-3">
							<div className="flex items-center gap-3">
								<active.leadIcon
									size={22}
									className="shrink-0 text-[#3ecf8e]"
								/>
								<span className="text-[15px] font-semibold text-[#e9ece9]">
									{active.headline}
								</span>
								{active.badge ? <BadgeTag badge={active.badge} /> : null}
							</div>
							<p className="text-[14px] leading-[1.55] text-[#8a918b]">
								{active.paragraph}
							</p>
						</div>
						<div>
							{active.rows.map((row) => (
								<div
									key={row}
									className="border-t border-[rgba(255,255,255,.06)] py-4 text-[14px] leading-[1.5] text-[#cfd6d0] first:border-t-0"
								>
									{row}
								</div>
							))}
						</div>
					</div>
					<div
						className="flex items-center justify-center p-6"
						style={{
							background:
								"radial-gradient(70% 70% at 50% 40%, rgba(62,207,142,.09), transparent 72%)",
						}}
					>
						{active.right}
					</div>
				</div>
			</Container>
		</section>
	);
}
