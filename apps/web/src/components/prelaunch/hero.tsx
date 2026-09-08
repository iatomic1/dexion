"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useAuthModal } from "~/contexts/AuthModalContext";
import { PillPrimary, PillSecondary } from "./ui";

export function PrelaunchHero() {
	const { openAuthModal } = useAuthModal();
	return (
		<section className="relative overflow-hidden">
			<div
				className="pointer-events-none absolute left-1/2 top-[-120px] h-[340px] w-[460px] -translate-x-1/2 sm:top-[-140px] sm:h-[520px] sm:w-[1100px]"
				style={{
					background:
						"radial-gradient(closest-side, rgba(62,207,142,.14), transparent 72%)",
				}}
			/>
			<div className="relative mx-auto flex max-w-[900px] flex-col items-center gap-5 px-[22px] pb-[clamp(40px,5vw,64px)] pt-[clamp(64px,9vw,120px)] text-center sm:px-6">
				<div
					className="h-[34px] w-[34px] shrink-0 rounded-[10px] md:h-[38px] md:w-[38px]"
					style={{ boxShadow: "0 0 34px rgba(62,207,142,.4)" }}
				>
					<Image
						src="/logo.png"
						alt="Dexion"
						width={48}
						height={48}
						className="h-full w-full rounded-[10px]"
					/>
				</div>

				<span className="inline-flex items-center gap-2 rounded-full border border-[rgba(62,207,142,.24)] bg-[rgba(62,207,142,.07)] px-3.5 py-2 font-mono text-[11px] uppercase tracking-[.18em] text-[#7de6b3]">
					<span className="dx-pulse-dot h-[5px] w-[5px] rounded-full bg-[#3ecf8e] shadow-[0_0_8px_#3ecf8e]" />
					Early access · open now
				</span>

				<h1 className="text-balance text-[38px] font-bold leading-[1.05] tracking-[-.03em] text-[#e9ece9] md:text-[clamp(34px,5.4vw,62px)] md:leading-[1.04]">
					The Market Edge
					<br />
					for Stacks
				</h1>

				<p className="text-pretty max-w-[520px] text-[15px] leading-[1.55] text-[#8a918b] md:text-[clamp(15px,1.4vw,18px)]">
					<span className="sm:hidden">
						Real-time prices, wallet activity, HodlMM range alerts and a full
						trading stack — live on the Stacks ecosystem.
					</span>
					<span className="hidden sm:inline">
						Real-time prices, wallet activity, HodlMM range alerts and a full
						trading stack — launching on the Stacks ecosystem.
					</span>
				</p>

				<div className="flex w-full flex-col gap-[9px] sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center sm:gap-[10px]">
					<PillPrimary
						size="hero"
						icon={ArrowRight}
						className="w-full sm:w-auto"
						onClick={() => openAuthModal({ view: "signup" })}
					>
						Start Beta
					</PillPrimary>
					<PillSecondary
						href="#features"
						size="hero"
						className="w-full sm:w-auto"
					>
						View Features
					</PillSecondary>
				</div>

				<div className="flex items-center gap-2 sm:hidden">
					<span className="inline-flex items-center rounded-full border border-[rgba(62,207,142,.26)] bg-[rgba(62,207,142,.08)] px-[11px] py-1.5 font-mono text-[9px] uppercase tracking-[.12em] text-[#7de6b3]">
						Early access
					</span>
					<span className="inline-flex items-center rounded-full border border-[rgba(255,255,255,.1)] px-[11px] py-1.5 font-mono text-[9px] uppercase tracking-[.12em] text-[#a4aca5]">
						No invite code
					</span>
				</div>

				<div className="mt-1 flex flex-col items-center gap-1.5">
					<span className="font-mono text-[11px] uppercase tracking-[.14em] text-[#5c635e]">
						Built on
					</span>
					<span className="flex items-center gap-2 text-[15px] font-semibold text-[#e9ece9]">
						<span
							className="h-[18px] w-[18px] rounded-[5px]"
							style={{
								background: "linear-gradient(140deg,#f5a623,#d9761a)",
							}}
						/>
						Stacks
					</span>
				</div>
			</div>
		</section>
	);
}
