import {
	ArrowDown,
	BarChart3,
	CreditCard,
	Globe,
	Link as LinkIcon,
	type LucideIcon,
	Mail,
	Send,
	TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { Container, IconChip, SectionHeader } from "./ui";

const RULES: {
	icon: LucideIcon;
	title: string;
	sub: string;
	tint?: boolean;
}[] = [
	{
		icon: TrendingUp,
		title: "STX above $1.90",
		sub: "RULE · price.above",
		tint: true,
	},
	{
		icon: BarChart3,
		title: "HodlMM out of range",
		sub: "RULE · hodlmm.range",
	},
	{
		icon: CreditCard,
		title: "Wallet SP2J…8QK4 moved",
		sub: "RULE · wallet.activity",
	},
];

const CHANNELS: {
	icon: LucideIcon;
	name: string;
	desc: string;
	mono?: boolean;
}[] = [
	{ icon: Send, name: "Telegram", desc: "Bot message, instantly" },
	{ icon: Mail, name: "Email", desc: "Per-event or digest" },
	{ icon: Globe, name: "Browser", desc: "Native web push" },
	{ icon: LinkIcon, name: "Webhooks", desc: "200 OK · signed", mono: true },
];

function RuleRow({ rule }: { rule: (typeof RULES)[number] }) {
	return (
		<div
			className={`flex items-center gap-3 rounded-[12px] px-[18px] py-4 ${
				rule.tint
					? "bg-[rgba(62,207,142,.07)]"
					: "border border-[rgba(255,255,255,.07)] bg-[rgba(255,255,255,.025)]"
			}`}
		>
			<IconChip icon={rule.icon} />
			<div className="flex flex-col">
				<span className="text-[14px] font-semibold text-[#e9ece9]">
					{rule.title}
				</span>
				<span className="font-mono text-[11px] text-[#6f766f]">{rule.sub}</span>
			</div>
		</div>
	);
}

function ChannelRow({
	channel,
	sent,
}: {
	channel: (typeof CHANNELS)[number];
	sent: boolean;
}) {
	return (
		<div className="flex items-center gap-3 rounded-[12px] border border-[rgba(255,255,255,.07)] bg-[rgba(255,255,255,.025)] px-[18px] py-4">
			<channel.icon size={19} className="shrink-0 text-[#cfd6d0]" />
			<div className="flex min-w-0 flex-1 flex-col">
				<span className="text-[15px] font-semibold text-[#e9ece9]">
					{channel.name}
				</span>
				<span
					className={`text-[13px] text-[#8a918b] ${channel.mono ? "font-mono" : ""}`}
				>
					{channel.desc}
				</span>
			</div>
			<span
				className={`font-mono text-[10px] uppercase tracking-[.1em] ${
					sent ? "text-[#3ecf8e]" : "text-[#6f766f]"
				}`}
			>
				Sent
			</span>
		</div>
	);
}

function Hub({ size, logoSize }: { size: number; logoSize: number }) {
	const glowInset = size >= 78 ? -22 : -16;
	const radius = size >= 78 ? 20 : 17;
	return (
		<div className="flex flex-col items-center gap-3">
			<div
				className="relative flex items-center justify-center border border-[rgba(62,207,142,.32)] bg-[rgba(6,10,8,.9)]"
				style={{ width: size, height: size, borderRadius: radius }}
			>
				<div
					className="pointer-events-none absolute rounded-full"
					style={{
						inset: glowInset,
						background:
							"radial-gradient(circle, rgba(62,207,142,.3), transparent 68%)",
					}}
				/>
				<Image
					src="/logo.png"
					alt="Dexion"
					width={48}
					height={48}
					className="relative rounded-[8px]"
					style={{ width: logoSize, height: logoSize }}
				/>
			</div>
			<span className="font-mono text-[11px] uppercase tracking-[.18em] text-[#e9ece9]">
				Rule engine
			</span>
			<span className="rounded-full border border-[rgba(62,207,142,.24)] bg-[rgba(62,207,142,.07)] px-3.5 py-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#7de6b3]">
				Fan-out · 0.8s
			</span>
		</div>
	);
}

export function PrelaunchNotificationsFanout() {
	return (
		<section className="border-t border-[rgba(255,255,255,.05)] py-[clamp(56px,7vw,104px)]">
			<Container className="flex flex-col gap-10">
				<SectionHeader
					title="Get notified anywhere"
					sub="Four channels. One rule engine."
				/>

				{/* Desktop: flex row, rules | hub | channels */}
				<div className="hidden flex-wrap items-center justify-center gap-[clamp(16px,2.2vw,28px)] sm:flex">
					<div className="flex min-w-[260px] flex-1 basis-[260px] flex-col gap-[10px]">
						{RULES.map((rule) => (
							<RuleRow key={rule.title} rule={rule} />
						))}
					</div>
					<div className="flex-none">
						<Hub size={78} logoSize={34} />
					</div>
					<div className="flex min-w-[260px] flex-1 basis-[260px] flex-col gap-[10px]">
						{CHANNELS.map((channel, i) => (
							<ChannelRow key={channel.name} channel={channel} sent={i === 0} />
						))}
					</div>
				</div>

				{/* Mobile: stacked with connector + 2x2 channel grid */}
				<div className="flex flex-col items-center gap-4 sm:hidden">
					<div className="flex w-full flex-col gap-[10px]">
						{RULES.slice(0, 2).map((rule) => (
							<RuleRow key={rule.title} rule={rule} />
						))}
					</div>
					<ArrowDown
						size={26}
						className="shrink-0"
						style={{ color: "rgba(62,207,142,.5)" }}
					/>
					<Hub size={60} logoSize={26} />
					<div className="grid w-full grid-cols-2 gap-[10px]">
						{CHANNELS.map((channel) => (
							<div
								key={channel.name}
								className="flex flex-col gap-2 rounded-[12px] border border-[rgba(255,255,255,.07)] bg-[rgba(255,255,255,.025)] p-[15px]"
							>
								<channel.icon size={19} className="text-[#cfd6d0]" />
								<span className="text-[14px] font-semibold text-[#e9ece9]">
									{channel.name}
								</span>
								<span
									className={`text-[11px] text-[#8a918b] ${channel.mono ? "font-mono" : ""}`}
								>
									{channel.desc}
								</span>
							</div>
						))}
					</div>
				</div>
			</Container>
		</section>
	);
}
