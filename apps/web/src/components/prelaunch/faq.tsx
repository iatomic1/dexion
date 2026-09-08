"use client";

import { useState } from "react";
import { Container } from "./ui";

const ITEMS = [
	{
		q: "What is Dexion?",
		a: "A crypto intelligence and trading platform for the Stacks ecosystem. The Price Tracker and Alert system are live in beta today; the wider trading stack keeps shipping alongside them.",
		mobile: true,
	},
	{
		q: "What does beta mean here?",
		a: "The product is usable today, with no invite code. We're still improving it in the open, so some newer surfaces change quickly and your feedback shapes what ships next.",
		mobileA:
			"The product is usable today, with no invite code. We're still improving it in the open, and your feedback shapes what ships next.",
		mobile: true,
	},
	{
		q: "What is included in the beta?",
		mobileQ: "What's included in the beta?",
		a: "The complete Price Tracker and Alert system — every token, every alert condition and all four notification channels. Nothing is held back behind an upgrade.",
		mobile: true,
	},
	{
		q: "How secure is wallet tracking?",
		a: "Tracking is read-only and needs nothing but a public address. Withdrawals on the trading side are protected by two-factor authentication.",
	},
	{
		q: "Do I need a Bitflow account for HodlMM alerts?",
		mobileQ: "Do I need a Bitflow account?",
		a: "No. Link your Stacks wallet and Dexion reads your existing HodlMM positions from Bitflow, then tracks each pool's range status. Alerts are webhook-first too, so every event can also arrive as signed JSON.",
		mobileA:
			"No. Link your Stacks wallet and Dexion reads your existing HodlMM positions from Bitflow, then tracks each pool's range status.",
		mobile: true,
	},
];

export function PrelaunchFaq() {
	const [open, setOpen] = useState(0);

	return (
		<section className="border-t border-[rgba(255,255,255,.05)] py-[clamp(56px,7vw,104px)]">
			<Container className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start gap-[clamp(12px,1.6vw,22px)]">
				<h2 className="text-[clamp(24px,3.4vw,42px)] font-bold leading-[1.1] tracking-[-.028em] text-[#e9ece9]">
					FAQ
				</h2>

				<div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,.07)] bg-[#0a0c0b]">
					{ITEMS.map((item, i) => {
						const isOpen = open === i;
						return (
							<div
								key={item.q}
								className={`border-t border-[rgba(255,255,255,.07)] first:border-t-0 ${
									item.mobile ? "" : "hidden sm:block"
								}`}
							>
								<button
									type="button"
									aria-expanded={isOpen}
									onClick={() => setOpen(isOpen ? -1 : i)}
									className="flex w-full items-center justify-between gap-4 px-5 py-[18px] text-left transition-colors outline-none hover:bg-[rgba(255,255,255,.02)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3ecf8e]"
								>
									<span className="text-[14px] font-semibold text-[#e9ece9] sm:text-[15px]">
										{item.mobileQ ? (
											<>
												<span className="sm:hidden">{item.mobileQ}</span>
												<span className="hidden sm:inline">{item.q}</span>
											</>
										) : (
											item.q
										)}
									</span>
									<span className="font-mono text-[14px] text-[#6f766f]">
										{isOpen ? "—" : "+"}
									</span>
								</button>
								{isOpen ? (
									<p className="text-pretty px-5 pb-[18px] text-[13px] leading-[1.65] text-[#8a918b] sm:text-[14px]">
										{item.mobileA ? (
											<>
												<span className="sm:hidden">{item.mobileA}</span>
												<span className="hidden sm:inline">{item.a}</span>
											</>
										) : (
											item.a
										)}
									</p>
								) : null}
							</div>
						);
					})}
				</div>
			</Container>
		</section>
	);
}
