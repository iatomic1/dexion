import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import SiteHeader from "~/components/layout/header/site-header";
import SiteFooter from "~/components/layout/site-footer/site-footer";
import { WatchListBanner } from "~/components/layout/watchlist-banner";
import { BtcStxPriceProvider } from "~/contexts/BtcStxPriceContext";
import { PresetsContextProvider } from "~/contexts/PresetsContext";
import { auth } from "~/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <BtcStxPriceProvider>
      <SiteHeader />
      <div className="hidden sm:block">
        <WatchListBanner />
      </div>
      <PresetsContextProvider>{children}</PresetsContextProvider>
      <SiteFooter />
    </BtcStxPriceProvider>
  );
}
