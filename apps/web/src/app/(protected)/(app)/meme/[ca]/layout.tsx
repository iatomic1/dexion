import type { Metadata } from "next";
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
