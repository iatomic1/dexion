"use client";

import { Send } from "lucide-react";
import { useAuthModal } from "~/contexts/AuthModalContext";
import { FOCUS_RING, PillPrimary } from "./ui";

export function PrelaunchStickyCtaBar() {
	const { openAuthModal } = useAuthModal();
	return (
		<div
			className="fixed inset-x-0 bottom-0 z-[11] flex items-center gap-2.5 px-[18px] pb-[max(26px,env(safe-area-inset-bottom))] pt-3.5 sm:hidden"
			style={{
				background: "linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.92) 38%)",
			}}
		>
			<PillPrimary
				className="flex-1 shadow-[0_12px_34px_rgba(62,207,142,.3)]"
				onClick={() => openAuthModal({ view: "signup" })}
			>
				Start Beta
			</PillPrimary>
			<button
				type="button"
				aria-label="Send"
				onClick={() => openAuthModal({ view: "signup" })}
				className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(255,255,255,.11)] bg-[rgba(255,255,255,.05)] text-[#e9ece9] backdrop-blur-[10px] ${FOCUS_RING}`}
			>
				<Send size={18} />
			</button>
		</div>
	);
}
