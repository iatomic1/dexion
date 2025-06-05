import { ReactNode } from "react";
import { WatchLists } from "../_components/watchlist";
import SiteFooter from "../_components/site-footer/site-footer";
import SiteHeader from "../_components/header/site-header";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <div className="hidden sm:block">
        <WatchLists />
      </div>
      {children}
      <SiteFooter />
    </>
  );
}
