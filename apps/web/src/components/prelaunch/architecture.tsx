import { Check } from "lucide-react";
import Image from "next/image";
import { Container } from "./ui";

const CHIPS = [
	{ label: "BITFLOW HODLMM", tint: true },
	{ label: "STACKS DEXES", tint: false },
	{ label: "POOLS", tint: false },
	{ label: "TOKENS", tint: false, desktopOnly: true },
	{ label: "PULSE", tint: true },
];

const SECURE_ROWS = [
	"2FA on every withdrawal",
	"Read-only wallet tracking",
	"Signed webhook payloads",
	"Email, Google or Web3 sign-in",
];

export function PrelaunchArchitecture() {
	return (
		<section className="border-t border-[rgba(255,255,255,.05)] py-[clamp(56px,7vw,104px)]">
			<Container className="flex flex-col gap-8">
				<h2 className="text-[clamp(24px,3.4vw,42px)] font-bold leading-[1.1] tracking-[-.028em] text-[#e9ece9]">
					Built to be trusted
				</h2>

				<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[clamp(16px,2vw,22px)]">
					<div className="flex flex-col gap-4 rounded-[14px] border border-[rgba(255,255,255,.07)] bg-[#0a0c0b] p-[clamp(20px,2.4vw,28px)]">
						<span className="text-[17px] font-semibold text-[#e9ece9]">
							Integrations
						</span>
						<p className="text-[14px] leading-[1.6] text-[#8a918b]">
							Dexion aggregates the DEXes, pools and token registries of the
							Stacks ecosystem into one consistent data layer.
						</p>
						<div className="flex flex-col items-center gap-4 rounded-xl bg-[rgba(4,6,5,.7)] p-5">
							<Image
								src="/logo.png"
								alt="Dexion"
								width={48}
								height={48}
								className="h-[34px] w-[34px] rounded-[9px]"
							/>
							<div className="w-full border-t border-[rgba(255,255,255,.07)]" />
							<div className="flex flex-wrap justify-center gap-2">
								{CHIPS.map((chip) => (
									<span
										key={chip.label}
										className={`rounded-full px-3 py-1.5 font-mono text-[11px] ${
											chip.desktopOnly ? "hidden sm:inline-flex" : ""
										} ${
											chip.tint
												? "bg-[rgba(62,207,142,.14)] text-[#7de6b3]"
												: "bg-[rgba(255,255,255,.06)] text-[#9aa29b]"
										}`}
									>
										{chip.label}
									</span>
								))}
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-4 rounded-[14px] border border-[rgba(255,255,255,.07)] bg-[#0a0c0b] p-[clamp(20px,2.4vw,28px)]">
						<span className="text-[17px] font-semibold text-[#e9ece9]">
							Secure by default
						</span>
						<p className="text-[14px] leading-[1.6] text-[#8a918b]">
							Two-factor on withdrawals, scoped keys and no custody of your
							positions — tracking never needs more access than it earns.
						</p>
						<div className="flex flex-col gap-3 rounded-xl bg-[rgba(4,6,5,.7)] p-5">
							{SECURE_ROWS.map((row) => (
								<div key={row} className="flex items-center gap-3">
									<Check size={17} className="shrink-0 text-[#3ecf8e]" />
									<span className="text-[14px] text-[#cfd6d0]">{row}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}
