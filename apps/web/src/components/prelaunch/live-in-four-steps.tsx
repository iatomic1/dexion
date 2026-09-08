import { Container } from "./ui";

const STEPS: {
	title: string;
	description: string;
	chips?: { label: string; tint?: boolean }[];
}[] = [
	{
		title: "Create an account",
		description:
			"Email, Google or a Web3 wallet. Access is open — nothing to request.",
	},
	{
		title: "Choose a token",
		description:
			"Search across every Stacks DEX and add it to a watchlist in one click.",
	},
	{
		title: "Configure alert conditions",
		description:
			"Price above or below a target, a TVL milestone, or a threshold of your own.",
	},
	{
		title: "Receive instant notifications",
		description: "Delivered in around 0.8 seconds, on the channels you pick.",
		chips: [
			{ label: "TELEGRAM", tint: true },
			{ label: "EMAIL" },
			{ label: "BROWSER" },
			{ label: "WEBHOOKS" },
		],
	},
];

export function PrelaunchLiveInFourSteps() {
	return (
		<section className="border-t border-[rgba(255,255,255,.05)] bg-[#050605] py-[clamp(48px,6vw,88px)]">
			<Container className="flex flex-col gap-6 sm:gap-[clamp(24px,3vw,40px)]">
				<div className="flex flex-col gap-2 sm:grid sm:grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] sm:items-start sm:gap-[clamp(20px,3vw,44px)]">
					<h2 className="text-[24px] font-bold leading-[1.1] tracking-[-.028em] text-[#e9ece9] sm:text-[clamp(24px,3.2vw,38px)]">
						Live in four steps
					</h2>
					<p className="text-pretty text-[14px] leading-[1.65] text-[#8a918b]">
						No invite code, no setup call. Sign up, pick a token, set the
						condition — the first alert lands on your channel minutes later.
					</p>
				</div>

				<div className="border-t border-[rgba(255,255,255,.08)]">
					{STEPS.map((step, i) => (
						<div
							key={step.title}
							className="grid grid-cols-[44px_minmax(0,1fr)] items-baseline gap-[14px] border-b border-[rgba(255,255,255,.07)] py-4 transition-colors duration-200 hover:bg-[rgba(255,255,255,.018)] sm:grid-cols-[minmax(0,88px)_minmax(0,1.1fr)_minmax(0,1.4fr)] sm:gap-[clamp(12px,2vw,32px)] sm:py-[clamp(20px,2.6vw,30px)]"
						>
							<span
								className={`font-mono text-[26px] leading-none sm:text-[clamp(28px,3.4vw,44px)] ${
									i === 0
										? "text-[rgba(62,207,142,.55)]"
										: "text-[rgba(255,255,255,.16)]"
								}`}
							>
								{String(i + 1).padStart(2, "0")}
							</span>
							<span className="text-[16px] font-semibold tracking-[-.01em] text-[#e9ece9] sm:text-[clamp(17px,1.8vw,22px)]">
								{step.title}
							</span>
							<div className="col-span-2 flex flex-col gap-[10px] sm:col-span-1">
								<p className="mt-1 text-[13px] leading-[1.6] text-[#7a827c] sm:mt-0 sm:text-[14px] sm:leading-[1.65]">
									{step.description}
								</p>
								{step.chips ? (
									<div className="hidden flex-wrap gap-[10px] sm:flex">
										{step.chips.map((chip) => (
											<span
												key={chip.label}
												className={`rounded-full px-[11px] py-1.5 font-mono text-[10px] uppercase tracking-[.1em] ${
													chip.tint
														? "border border-[rgba(62,207,142,.26)] bg-[rgba(62,207,142,.08)] text-[#7de6b3]"
														: "border border-[rgba(255,255,255,.1)] text-[#a4aca5]"
												}`}
											>
												{chip.label}
											</span>
										))}
									</div>
								) : null}
							</div>
						</div>
					))}
				</div>
			</Container>
		</section>
	);
}
