import { ReactNode } from "react";
import { WatchLists } from "../_components/watchlist";
import SiteFooter from "../_components/site-footer/site-footer";
import SiteHeader from "../_components/header/site-header";
import { withAuth } from "~/lib/session";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { session, user } = await withAuth();

  if (!session) {
    redirect("/");
  }

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
