// import "@repo/ui/globals.css";
import "./globals.css";
import type React from "react";
import type { Metadata } from "next";
import SiteHeader from "./_components/header/site-header";
import { ThemeProvider } from "./_components/theme-provider";
import { Toaster } from "@repo/ui/components/ui/sonner";
import { TokenRefresher } from "./_components/token-refresher";
import SiteFooter from "./_components/site-footer";
import { WalletTrackerSocketProvider } from "~/contexts/WalletTrackerSocketContext";
import { geistSans } from "./fonts/geist";
import { PresetsContextProvider } from "~/contexts/PresetsContext";

export const metadata: Metadata = {
  title: "DEXION Pro - Cryptocurrency Trading Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={geistSans.variable}>
        <TokenRefresher />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" richColors />
          {/* <WalletTrackerSocketProvider> */}
          <PresetsContextProvider>
            <div className="flex min-h-screen flex-col font-geist">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              {/* <SiteFooter /> */}
            </div>
          </PresetsContextProvider>
          {/* </WalletTrackerSocketProvider> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
