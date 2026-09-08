"use client";

import Image from "next/image";
import { useAuthModal } from "~/contexts/AuthModalContext";
import { Container, PillPrimary } from "./ui";

export function PrelaunchHeader() {
	const { openAuthModal } = useAuthModal();
	return (
		<header className="sticky top-0 z-30 border-b border-[rgba(255,255,255,.07)] bg-[rgba(0,0,0,.72)] backdrop-blur-[14px]">
			<Container className="flex items-center justify-between gap-5 py-[11px] md:py-[14px]">
				<div className="flex shrink-0 items-center gap-2.5">
					<Image
						src="/logo.png"
						alt="Dexion"
						width={48}
						height={48}
						className="h-[22px] w-[22px] rounded-[6px] md:h-6 md:w-6"
					/>
					<span className="whitespace-nowrap text-[15px] font-semibold text-[#e9ece9] md:text-base">
						Dexion
						<span className="font-normal text-[#7a827c]"> Pro</span>
					</span>
				</div>
				<div className="flex items-center gap-2.5">
					<span className="hidden items-center gap-2 rounded-full border border-[rgba(62,207,142,.24)] bg-[rgba(62,207,142,.07)] px-3.5 py-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#7de6b3] sm:inline-flex">
						<span className="dx-pulse-dot h-[5px] w-[5px] rounded-full bg-[#3ecf8e] shadow-[0_0_8px_#3ecf8e]" />
						Beta live
					</span>
					<span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[rgba(62,207,142,.24)] bg-[rgba(62,207,142,.07)] px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[.14em] text-[#7de6b3] sm:hidden">
						<span className="dx-pulse-dot h-1 w-1 rounded-full bg-[#3ecf8e] shadow-[0_0_8px_#3ecf8e]" />
						Beta live
					</span>
					<span className="hidden sm:inline-flex">
						<PillPrimary
							size="sm"
							onClick={() => openAuthModal({ view: "signup" })}
						>
							Start beta
						</PillPrimary>
					</span>
				</div>
			</Container>
		</header>
	);
}
