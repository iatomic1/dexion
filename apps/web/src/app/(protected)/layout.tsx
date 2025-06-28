import { ReactNode } from "react";
import { PresetsContextProvider } from "~/contexts/PresetsContext";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import SiteHeader from "~/components/layout/header/site-header";
import SiteFooter from "~/components/layout/site-footer/site-footer";
import { WatchListBanner } from "~/components/layout/watchlist-banner";
import { BtcStxPriceProvider } from "~/contexts/BtcStxPriceContext";

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
