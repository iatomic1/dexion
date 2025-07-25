import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import SiteHeader from "~/components/layout/header/site-header";
import SiteFooter from "~/components/layout/site-footer/site-footer";
import { WatchListBanner } from "~/components/layout/watchlist-banner";
import { BtcStxPriceProvider } from "~/contexts/BtcStxPriceContext";
import { PresetsContextProvider } from "~/contexts/PresetsContext";
import { WatchlistProvider } from "~/contexts/WatchlistContext";
import { auth } from "~/lib/auth/auth";

export default async function ProtectedLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<BtcStxPriceProvider>
			<WatchlistProvider>
				<SiteHeader />
				<div className="hidden sm:block">
					<WatchListBanner />
				</div>
				<PresetsContextProvider>{children}</PresetsContextProvider>
				<SiteFooter />
			</WatchlistProvider>
		</BtcStxPriceProvider>
	);
}
