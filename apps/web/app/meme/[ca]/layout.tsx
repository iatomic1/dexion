import type { Metadata } from "next";
import { WatchLists } from "~/app/_components/watchlist";
import { TokenSocketProvider } from "~/contexts/TokenWatcherSocketContext";

export const metadata: Metadata = {
  title: "MEME",
};

export default function MemePageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TokenSocketProvider>{children}</TokenSocketProvider>;
}
