import { headers } from "next/headers";
import type { ReactNode } from "react";
import { AlertsNotificationFeed } from "~/components/alert-notification-feed";
import AlertSheetRoot from "~/components/layout/alert-sheet-root";
import WalletTrackerBanner from "~/components/layout/banners/wallet-tracker-banner";
import MobileBottomNav from "~/components/layout/header/mobile-bottom-nav";
import SiteHeader from "~/components/layout/header/site-header";
import SiteFooter from "~/components/layout/site-footer/site-footer";
import { SocketProvider } from "~/contexts/SocketProvider";
import { auth } from "~/lib/auth/auth";

export default async function ProtectedLayout({
	children,
}: {
	children: ReactNode;
}) {
	const tokenData = await auth.api.getToken({
		headers: await headers(),
	});
	if (!tokenData.token) {
		throw new Error("Error trying to get the access token");
	}
	return (
		<SocketProvider token={tokenData?.token}>
			<WalletTrackerBanner />
			<AlertSheetRoot />
			<SiteHeader />
			<div className="pb-[76px] sm:pb-0">{children}</div>
			<SiteFooter />
			<MobileBottomNav />
			<AlertsNotificationFeed />
		</SocketProvider>
	);
}
