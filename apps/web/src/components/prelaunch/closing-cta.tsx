"use client";

import { ArrowRight } from "lucide-react";
import { useAuthModal } from "~/contexts/AuthModalContext";
import { PillPrimary } from "./ui";

export function PrelaunchClosingCta() {
	const { openAuthModal } = useAuthModal();
	return (
		<section
			className="relative overflow-hidden"
			style={{
				background: "linear-gradient(180deg,#050605,#08150e 55%,#0a1c13)",
			}}
		>
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(80% 120% at 50% 130%, rgba(62,207,142,.28), transparent 62%)",
				}}
			/>
			<div className="relative mx-auto flex max-w-[900px] flex-col items-center gap-5 px-[22px] py-[44px] text-center sm:px-6 sm:py-[clamp(72px,9vw,132px)]">
				<h2 className="text-balance text-[32px] font-bold leading-[1.06] tracking-[-.032em] text-[#e9ece9] sm:text-[clamp(28px,4.2vw,52px)]">
					Start Tracking
					<br />
					Smarter.
				</h2>
				<p className="text-pretty max-w-[480px] text-[15px] leading-[1.55] text-[#9aa29b]">
					Join the beta today and never miss another market movement.
				</p>
				<PillPrimary
					size="closing"
					icon={ArrowRight}
					className="shadow-[0_16px_44px_rgba(62,207,142,.3)]"
					onClick={() => openAuthModal({ view: "signup" })}
				>
					Start Beta
				</PillPrimary>
				<span className="font-mono text-[12px] uppercase tracking-[.14em] text-[#6f766f]">
					Open beta · no invite code
				</span>
			</div>
		</section>
	);
}
