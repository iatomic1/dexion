import type { Metadata } from "next";
import siteConfig from "~/config/site";
import { TokenSocketProvider } from "~/contexts/TokenWatcherSocketContext";

export const metadata: Metadata = {
	title: "Meme Token",
	robots: {
		index: false,
		follow: false,
	},
};

export default function MemePageLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	if (!siteConfig.features.trading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-4 text-center">
				<h1 className="text-lg font-semibold">Trading is paused</h1>
				<p className="max-w-sm text-sm text-muted-foreground">
					Token trading is temporarily disabled for maintenance. Check back
					soon.
				</p>
			</div>
		);
	}

	return <TokenSocketProvider>{children}</TokenSocketProvider>;
}
