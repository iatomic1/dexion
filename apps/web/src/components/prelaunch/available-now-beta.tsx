"use client";

import { ArrowRight, Check } from "lucide-react";
import { useAuthModal } from "~/contexts/AuthModalContext";
import { Container, PillPrimary, StatusPill } from "./ui";

const PANEL_ROWS = [
	{
		title: "Real-time monitoring",
		sub: "Cross-DEX prices refreshed in under two seconds.",
	},
	{
		title: "Instant alerts",
		sub: "Rules fire and fan out in around 0.8 seconds.",
	},
	{
		title: "Flexible notification channels",
		sub: "Telegram, email, browser and webhooks, per alert.",
	},
	{
		title: "Continuous improvements",
		sub: "Shipped throughout beta, informed by your feedback.",
	},
];

function Panel() {
	return (
		<div className="overflow-hidden rounded-[16px] border border-[rgba(255,255,255,.08)] bg-[#0a0c0b]">
			<div className="flex items-center justify-between border-b border-[rgba(255,255,255,.07)] px-[16px] py-[14px] sm:px-[22px] sm:py-[18px]">
				<span className="text-[14px] font-semibold text-[#e9ece9] sm:text-[15px]">
					What You'll Get
				</span>
				<span className="rounded-full bg-[rgba(62,207,142,.14)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.14em] text-[#7de6b3]">
					BETA
				</span>
			</div>
			{PANEL_ROWS.map((row, i) => (
				<div
					key={row.title}
					className={`flex items-start gap-3 px-[16px] py-[14px] sm:px-[22px] sm:py-[18px] ${
						i < PANEL_ROWS.length - 1
							? "border-b border-[rgba(255,255,255,.07)]"
							: ""
					}`}
				>
					<Check
						size={15}
						className="mt-0.5 shrink-0 text-[#3ecf8e] sm:size-[17px]"
					/>
					<div className="flex flex-col">
						<span className="text-[13px] font-semibold text-[#e9ece9] sm:text-[15px]">
							{row.title}
						</span>
						<span className="text-[12px] text-[#7a827c] sm:text-[13px]">
							{row.sub}
						</span>
					</div>
				</div>
			))}
		</div>
	);
}

export function PrelaunchAvailableNowBeta() {
	const { openAuthModal } = useAuthModal();
	return (
		<section
			id="beta"
			className="relative overflow-hidden border-t border-[rgba(255,255,255,.05)] bg-[#050605] py-[clamp(56px,7vw,96px)]"
		>
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(70% 90% at 50% 0%, rgba(62,207,142,.12), transparent 68%)",
				}}
			/>
			<Container className="relative">
				{/* Mobile: pill, h2, paragraph, panel, then a standalone mono line — no CTA button (sticky bar carries it) */}
				<div className="flex flex-col items-start gap-[18px] sm:hidden">
					<StatusPill>Early access beta</StatusPill>
					<h2 className="text-balance text-[26px] font-bold leading-[1.08] tracking-[-.03em] text-[#e9ece9]">
						Available Now in Beta
					</h2>
					<p className="text-pretty text-[14px] leading-[1.6] text-[#8a918b]">
						We're onboarding early users to help shape Dexion. During beta
						you'll get access to the complete Price Tracker and Alert system
						while we continue improving the platform based on feedback.
					</p>
					<Panel />
					<span className="font-mono text-[10px] uppercase tracking-[.1em] text-[#6f766f]">
						Open to everyone · no invite code
					</span>
				</div>

				{/* Desktop: two columns, left stacks pill/h2/paragraph/CTA/feedback, right is the panel */}
				<div className="hidden grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-center gap-[clamp(28px,4vw,52px)] sm:grid">
					<div className="flex flex-col items-start gap-[18px]">
						<StatusPill>Early access beta</StatusPill>
						<h2 className="text-balance text-[clamp(26px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-.03em] text-[#e9ece9]">
							Available Now in Beta
						</h2>
						<p className="text-pretty max-w-[540px] text-[clamp(15px,1.4vw,18px)] leading-[1.62] text-[#8a918b]">
							We're onboarding early users to help shape Dexion. During beta
							you'll get access to the complete Price Tracker and Alert system
							while we continue improving the platform based on feedback.
						</p>
						<div className="flex flex-wrap items-center gap-3">
							<PillPrimary
								icon={ArrowRight}
								className="px-[26px] py-[13px] text-[15px] shadow-[0_16px_44px_rgba(62,207,142,.28)]"
								onClick={() => openAuthModal({ view: "signup" })}
							>
								Join Beta
							</PillPrimary>
							<span className="text-[13px] text-[#7a827c]">
								Open to everyone · no invite code
							</span>
						</div>
						<span className="font-mono text-[12px] uppercase tracking-[.1em] text-[#6f766f]">
							Your feedback directly influences future releases.
						</span>
					</div>
					<Panel />
				</div>
			</Container>
		</section>
	);
}
