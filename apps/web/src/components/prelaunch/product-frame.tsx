import Image from "next/image";
import { Container } from "./ui";

const TOKENS = [
	{ symbol: "STX", price: "$1.842", delta: "+4.21%", tone: "up" as const },
	{ symbol: "sBTC", price: "$64,120", delta: "+0.94%", tone: "up" as const },
	{ symbol: "ALEX", price: "$0.0614", delta: "-1.08%", tone: "down" as const },
	{
		symbol: "WELSH",
		price: "$0.0021",
		delta: "+7.60%",
		tone: "up" as const,
		desktopOnly: true,
	},
];

const NAV_ITEMS = [
	{ label: "Markets", active: true },
	{ label: "Wallets", active: false },
	{ label: "Alerts", active: false, desktopOnly: true },
	{ label: "Pulse", active: false, desktopOnly: true },
];

export function PrelaunchProductFrame() {
	return (
		<Container className="pb-[clamp(56px,7vw,96px)] pt-0">
			<div
				className="relative overflow-hidden rounded-[16px] border border-[rgba(255,255,255,.07)] p-[clamp(20px,3vw,44px)]"
				style={{ background: "linear-gradient(180deg,#0d0f0e,#070807)" }}
			>
				<div
					className="pointer-events-none absolute inset-x-0 top-0 h-[260px]"
					style={{
						background:
							"radial-gradient(80% 60% at 50% 0%, rgba(62,207,142,.1), transparent 70%)",
					}}
				/>
				<div className="relative overflow-hidden rounded-xl border border-[rgba(255,255,255,.08)] bg-[rgba(4,6,5,.9)] shadow-[0_30px_90px_rgba(0,0,0,.7)]">
					<div className="flex items-center justify-between gap-4 border-b border-[rgba(255,255,255,.06)] px-4 py-3">
						<div className="flex items-center gap-5">
							<Image
								src="/logo.png"
								alt="Dexion"
								width={48}
								height={48}
								className="h-[15px] w-[15px] rounded-[4px] sm:h-[18px] sm:w-[18px]"
							/>
							<nav className="flex items-center gap-4 text-[12px]">
								{NAV_ITEMS.map((item) => (
									<span
										key={item.label}
										className={`${item.desktopOnly ? "hidden sm:inline" : ""} ${
											item.active ? "text-[#e9ece9]" : "text-[#7a827c]"
										}`}
									>
										{item.label}
									</span>
								))}
							</nav>
						</div>
						<span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[.14em] text-[#3ecf8e]">
							<span className="h-[5px] w-[5px] rounded-full bg-[#3ecf8e] shadow-[0_0_8px_#3ecf8e]" />
							Live
						</span>
					</div>

					<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))]">
						<div className="border-b border-[rgba(255,255,255,.06)] sm:border-b-0 sm:border-r">
							<div className="hidden grid-cols-[1fr_auto_auto] gap-3 px-4 pt-3 font-mono text-[9px] uppercase tracking-[.16em] text-[#5c635e] sm:grid">
								<span>Token</span>
								<span className="text-right">Price</span>
								<span className="text-right">24h</span>
							</div>
							{TOKENS.map((token) => (
								<div
									key={token.symbol}
									className={`${
										token.desktopOnly ? "hidden sm:grid" : "grid"
									} grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-[rgba(255,255,255,.04)] px-4 py-3 first:border-t-0`}
								>
									<span className="text-[12px] font-semibold text-[#e9ece9] sm:text-[13px]">
										{token.symbol}
									</span>
									<span className="text-right font-mono text-[12px] text-[#e9ece9] sm:text-[13px]">
										{token.price}
									</span>
									<span
										className={`text-right font-mono text-[11px] ${
											token.tone === "up" ? "text-[#3ecf8e]" : "text-[#e0705c]"
										}`}
									>
										{token.delta}
									</span>
								</div>
							))}
						</div>

						<div className="flex flex-col gap-2 p-4">
							<span className="text-[11px] text-[#5c635e]">STX / USD</span>
							<div className="flex items-baseline gap-2">
								<span className="font-mono text-[22px] text-[#e9ece9]">
									$1.842
								</span>
								<span className="font-mono text-[11px] text-[#3ecf8e]">
									+4.21%
								</span>
							</div>
							<svg
								viewBox="0 0 300 100"
								preserveAspectRatio="none"
								className="h-[88px] w-full sm:h-[140px]"
								role="img"
								aria-label="Illustrative STX price chart trending upward"
							>
								<title>Illustrative STX price chart trending upward</title>
								<defs>
									<linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="rgba(62,207,142,.34)" />
										<stop offset="100%" stopColor="rgba(62,207,142,0)" />
									</linearGradient>
								</defs>
								<path
									d="M0,78 L30,70 L60,74 L90,52 L120,58 L150,36 L180,42 L210,24 L240,30 L270,14 L300,20 L300,100 L0,100 Z"
									fill="url(#areaFill)"
								/>
								<path
									d="M0,78 L30,70 L60,74 L90,52 L120,58 L150,36 L180,42 L210,24 L240,30 L270,14 L300,20"
									fill="none"
									stroke="#3ecf8e"
									className="[stroke-width:3] sm:[stroke-width:2.4]"
								/>
							</svg>
						</div>
					</div>
				</div>
				<p className="mt-[clamp(20px,3vw,44px)] text-center text-[14px] font-semibold text-[#e9ece9] sm:text-[clamp(16px,1.8vw,22px)]">
					The live dashboard — usable today
				</p>
			</div>
		</Container>
	);
}
