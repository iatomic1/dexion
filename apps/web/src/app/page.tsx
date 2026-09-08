import { FRONTEND_URL } from "@dexion/shared";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Suspense } from "react";
import { archivo, jetbrainsMono } from "~/app/fonts/dexion-landing";
import { AuthViewParamListener } from "~/components/auth/auth-view-param-listener";
import { PrelaunchArchitecture } from "~/components/prelaunch/architecture";
import { PrelaunchAvailableNowBeta } from "~/components/prelaunch/available-now-beta";
import { PrelaunchClosingCta } from "~/components/prelaunch/closing-cta";
import { PrelaunchFaq } from "~/components/prelaunch/faq";
import { PrelaunchFeatureSwitcher } from "~/components/prelaunch/feature-switcher";
import { PrelaunchFooter } from "~/components/prelaunch/footer";
import { PrelaunchHeader } from "~/components/prelaunch/header";
import { PrelaunchHero } from "~/components/prelaunch/hero";
import { PrelaunchHodlmmSpotlight } from "~/components/prelaunch/hodlmm-spotlight";
import { PrelaunchLiveInFourSteps } from "~/components/prelaunch/live-in-four-steps";
import { PrelaunchNotificationsFanout } from "~/components/prelaunch/notifications-fanout";
import { PrelaunchProductFrame } from "~/components/prelaunch/product-frame";
import { PrelaunchStickyCtaBar } from "~/components/prelaunch/sticky-cta-bar";

export const metadata: Metadata = {
	title: "Dexion Pro — The Market Edge for Stacks",
	description:
		"Real-time crypto alerts for the Stacks ecosystem. Prices, wallets, HodlMM range alerts and a full trading stack — live in open beta.",
	alternates: {
		canonical: FRONTEND_URL,
	},
};

export default function Home() {
	return (
		<div
			className={`${archivo.variable} ${jetbrainsMono.variable} bg-black text-[#e9ece9] antialiased`}
			style={
				{
					fontFamily: "var(--font-archivo)",
					"--font-mono": "var(--font-jetbrains-mono)",
				} as CSSProperties
			}
		>
			<Suspense fallback={null}>
				<AuthViewParamListener />
			</Suspense>
			<PrelaunchHeader />
			<PrelaunchHero />
			<PrelaunchProductFrame />
			<PrelaunchFeatureSwitcher />
			<PrelaunchLiveInFourSteps />
			<PrelaunchNotificationsFanout />
			<PrelaunchAvailableNowBeta />
			<PrelaunchHodlmmSpotlight />
			<PrelaunchArchitecture />
			<PrelaunchFaq />
			<PrelaunchClosingCta />
			<div className="border-t border-[rgba(255,255,255,.06)] bg-black py-4 text-center">
				<span className="text-[13px] text-[#8a918b]">
					Charts are powered by{" "}
					<a
						href="https://tradingview.com"
						target="_blank"
						rel="noopener noreferrer"
						className="text-[#3ecf8e] underline hover:text-[#7de6b3]"
					>
						TradingView
					</a>
				</span>
			</div>
			<PrelaunchFooter />
			{/* Reserve space so mobile content clears the fixed sticky CTA bar */}
			<div className="h-24 sm:hidden" aria-hidden="true" />
			<PrelaunchStickyCtaBar />
		</div>
	);
}
