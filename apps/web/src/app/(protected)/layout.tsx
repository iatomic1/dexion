import type { ReactNode } from "react";
import WalletTrackerBanner from "~/components/layout/banners/wallet-tracker-banner";
import MobileBottomNav from "~/components/layout/header/mobile-bottom-nav";
import SiteHeader from "~/components/layout/header/site-header";
import SiteFooter from "~/components/layout/site-footer/site-footer";

export default async function ProtectedLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<>
			<WalletTrackerBanner />
			<SiteHeader />
			<div className="pb-[76px] sm:pb-0">{children}</div>
			<SiteFooter />
			<MobileBottomNav />
		</>
	);
}
