import "./globals.css";
import { FRONTEND_URL } from "@dexion/shared";
import { Toaster } from "@dexion/ui/components/ui/sonner";
import { TooltipProvider } from "@dexion/ui/components/ui/tooltip";
import { DeviceContextProvider } from "@dexion/ui/hooks/use-is-mobile";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { Metadata } from "next";
import Script from "next/script";
import type React from "react";
import { Providers } from "~/components/providers/auth-provider";
import { ClientQueryProvider } from "~/components/providers/query-client-provider";
import { ThemePresetProvider } from "~/components/providers/theme-preset-provider";
import { ThemeProvider } from "~/components/providers/theme-provider";
import { AuthClientContextProvider } from "~/contexts/AuthClientContext";
import { AuthModalProvider } from "~/contexts/AuthModalContext";
import { PresetsContextProvider } from "~/contexts/PresetsContext";
import { getDevice } from "~/lib/get-device";
import { THEME_PRESET_BLOCKING_SCRIPT } from "~/lib/themes";
import { geistMono, geistSans } from "./fonts/geist";

const title = "DEXION Pro - Cryptocurrency Trading Platform";
const description =
	"The all-in-one web-based trading bot on Stacks, designed for speed, security, and simplicity. Trade smarter, not harder with our advanced features.";

export const metadata: Metadata = {
	title: {
		template: "%s | DEXION Pro",
		default: title,
	},
	description: description,
	metadataBase: new URL(FRONTEND_URL),
	keywords: [
		"DEXION",
		"trading bot",
		"Stacks",
		"crypto trading",
		"web3",
		"decentralized exchange",
	],
	openGraph: {
		title: title,
		description: description,
		url: FRONTEND_URL,
		siteName: "DEXION Pro",
		images: [
			{
				url: `${FRONTEND_URL}/opengraph-image.png`,
				width: 1200,
				height: 630,
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: title,
		description: description,
		creator: "@dexion_pro",
		images: [`${FRONTEND_URL}/opengraph-image.png`],
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const isMobile = await getDevice();
	return (
		<html lang="en" suppressHydrationWarning className="dark">
			<head>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: blocking preset-flash guard, must run before paint */}
				<script
					dangerouslySetInnerHTML={{ __html: THEME_PRESET_BLOCKING_SCRIPT }}
				/>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<AuthClientContextProvider>
					<Providers>
						<ThemeProvider
							attribute="class"
							defaultTheme="dark"
							enableSystem
							disableTransitionOnChange
						>
							<ThemePresetProvider>
								<Toaster
									position="top-center"
									// richColors
									theme="light"
									visibleToasts={1}
									expand={true}
								/>
								{/* <WalletTrackerSocketProvider> */}
								<PresetsContextProvider>
									<AuthModalProvider>
										<div className="flex min-h-screen flex-col font-geist">
											<ClientQueryProvider>
												{/*{process.env.NODE_ENV !== "production" && (
												<ReactQueryDevtools buttonPosition="bottom-right" />
											)}*/}
												<DeviceContextProvider isMobile={isMobile}>
													<TooltipProvider>
														<main className="flex-1">{children}</main>
													</TooltipProvider>
												</DeviceContextProvider>
											</ClientQueryProvider>
										</div>
									</AuthModalProvider>
								</PresetsContextProvider>
							</ThemePresetProvider>
							{process.env.NODE_ENV === "production" && (
								<Script
									src="https://cdn.databuddy.cc/databuddy.js"
									strategy="afterInteractive"
									async
									data-client-id="rAfsBCtxnJvNZkVLfnP3H"
									data-track-attributes={false}
									data-track-errors={true}
									data-track-outgoing-links={false}
									data-track-web-vitals={true}
									data-track-sessions={false}
									data-track-exit-intent="true"
								/>
							)}
						</ThemeProvider>
					</Providers>
				</AuthClientContextProvider>
			</body>
		</html>
	);
}
