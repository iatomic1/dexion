// import "@repo/ui/globals.css";

import { TurnkeyProvider } from "@turnkey/sdk-react";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@repo/ui/components/ui/sonner";
import type { Metadata } from "next";
import type React from "react";
import { ReactScan } from "~/components/layout/react-scan";
import { ClientQueryProvider } from "~/components/providers/query-client-provider";
import { ThemeProvider } from "~/components/providers/theme-provider";
import { turnkeyConfig } from "~/config/turnkey";
import { AuthClientContextProvider } from "~/contexts/AuthClientContext";
import { PresetsContextProvider } from "~/contexts/PresetsContext";
import { DEV } from "~/lib/constants";
import { geistMono, geistSans } from "./fonts/geist";

export const metadata: Metadata = {
	title: "DEXION Pro - Cryptocurrency Trading Platform",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning className="dark">
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<ReactScan />
				{/* <TokenRefresher /> */}
				<AuthClientContextProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						enableSystem
						disableTransitionOnChange
					>
						<Toaster
							position="top-center"
							// richColors
							theme="light"
							visibleToasts={1}
							expand={true}
						/>
						{/* <WalletTrackerSocketProvider> */}
						<PresetsContextProvider>
							<div className="flex min-h-screen flex-col font-geist">
								{/* {!DEV && (
								<div className="flex w-full items-center justify-center text-center text-sm py-3 text-destructive">
									This website is still actively in development.
								</div>
							)} */}

								<ClientQueryProvider>
									<main className="flex-1">
										<TurnkeyProvider config={turnkeyConfig}>
											{children}
										</TurnkeyProvider>
									</main>
								</ClientQueryProvider>
							</div>
						</PresetsContextProvider>
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

						{/* </WalletTrackerSocketProvider> */}
					</ThemeProvider>
				</AuthClientContextProvider>
			</body>
		</html>
	);
}
