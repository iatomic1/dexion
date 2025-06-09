import { ReactNode } from "react";
import { WatchLists } from "../_components/watchlist";
import SiteFooter from "../_components/site-footer/site-footer";
import SiteHeader from "../_components/header/site-header";
import { withAuth } from "~/lib/session";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
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
    <>
      <SiteHeader />
      <div className="hidden sm:block">{/* <WatchLists /> */}</div>
      {children}
      <SiteFooter />
    </>
  );
}
