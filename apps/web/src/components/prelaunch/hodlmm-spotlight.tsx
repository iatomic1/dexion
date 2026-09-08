import { AlertTriangle, Check, Send } from "lucide-react";
import { Container, IconChip } from "./ui";

const CHECKS = [
	"Positions discovered automatically on wallet link",
	"Range status polled continuously, per pool",
	"Notified on the flip — in or out — on your channels",
];

const CARDS = [
	{
		tone: "negative" as const,
		icon: AlertTriangle,
		title: "Position out of range",
		sub: "STX / ALEX · earning $0 in fees",
		time: "now",
	},
	{
		tone: "accent" as const,
		icon: Check,
		title: "Back in range",
		sub: "STX / sBTC · fees accruing again",
		time: "12m",
	},
	{
		tone: "neutral" as const,
		icon: Send,
		title: "Delivered to Telegram",
		sub: "Rebalance prompt with pool link",
		time: "0.8s",
		accentTime: true,
	},
];

const MOBILE_BIN_HEIGHTS = [22, 36, 54, 78, 100, 70, 46, 30, 18];
const MOBILE_ACTIVE_INDEX = MOBILE_BIN_HEIGHTS.indexOf(
	Math.max(...MOBILE_BIN_HEIGHTS),
);

function MobileHistogramMock() {
	return (
		<div
			className="w-full rounded-[12px] border border-[rgba(255,255,255,.08)] bg-[rgba(4,6,5,.9)] p-4"
			aria-hidden="true"
		>
			<div className="flex items-end gap-[3px]" style={{ height: 60 }}>
				{MOBILE_BIN_HEIGHTS.map((h, i) => {
					const isActive = i === MOBILE_ACTIVE_INDEX;
					const isShoulder = Math.abs(i - MOBILE_ACTIVE_INDEX) === 1;
					return (
						<div
							key={`mbin-${i}-${h}`}
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
		</div>
	);
}

export function PrelaunchHodlmmSpotlight() {
	return (
		<section className="border-t border-[rgba(255,255,255,.05)] py-[clamp(56px,7vw,104px)]">
			<Container className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-center gap-[clamp(28px,4vw,52px)]">
				<div className="flex flex-col gap-5">
					<div className="flex items-center gap-3">
						<span className="rounded-full bg-[rgba(62,207,142,.14)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.14em] text-[#7de6b3]">
							Bitflow integration
						</span>
						<span className="font-mono text-[11px] text-[#7a827c]">
							Live in beta
						</span>
					</div>
					<h2 className="text-balance text-[clamp(24px,3.4vw,42px)] font-bold leading-[1.1] tracking-[-.028em] text-[#e9ece9]">
						Your HodlMM liquidity, watched
					</h2>
					<p className="text-pretty text-[clamp(14px,1.35vw,17px)] leading-[1.6] text-[#8a918b]">
						HodlMM concentrates liquidity into discrete price bins — you collect
						fees only while the active bin sits inside your range. When price
						drifts out, the position stops earning and gives no signal that it
						has. Dexion links your Stacks wallet, discovers every HodlMM
						position, and tracks each one's range status in the background.
					</p>
					<div className="flex flex-col gap-3">
						{CHECKS.map((check) => (
							<div key={check} className="flex items-start gap-3">
								<Check size={17} className="mt-0.5 shrink-0 text-[#3ecf8e]" />
								<span className="text-[14px] leading-[1.6] text-[#cfd6d0]">
									{check}
								</span>
							</div>
						))}
					</div>
				</div>

				<div className="hidden flex-col gap-3 sm:flex">
					{CARDS.map((card) => (
						<div
							key={card.title}
							className="flex items-center gap-4 rounded-[14px] border border-[rgba(255,255,255,.07)] bg-[#0a0c0b] p-5"
						>
							<IconChip
								icon={card.icon}
								size={40}
								radius={11}
								tone={card.tone}
							/>
							<div className="flex min-w-0 flex-1 flex-col">
								<span className="text-[15px] font-semibold text-[#e9ece9]">
									{card.title}
								</span>
								<span className="text-[13px] text-[#8a918b]">{card.sub}</span>
							</div>
							<span
								className={`font-mono text-[11px] ${card.accentTime ? "text-[#3ecf8e]" : "text-[#6f766f]"}`}
							>
								{card.time}
							</span>
						</div>
					))}
				</div>

				<div className="sm:hidden">
					<MobileHistogramMock />
				</div>
			</Container>
		</section>
	);
}
