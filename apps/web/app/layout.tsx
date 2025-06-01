// import "@repo/ui/globals.css";
import "./globals.css";
import type React from "react";
import type { Metadata } from "next";
import { ThemeProvider } from "./_components/theme-provider";
import { Toaster } from "@repo/ui/components/ui/sonner";
import { TokenRefresher } from "./_components/token-refresher";
import { geistMono, geistSans } from "./fonts/geist";
import { PresetsContextProvider } from "~/contexts/PresetsContext";
import SiteHeader from "./_components/header/site-header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClientQueryProvider } from "./_components/query-client-provider";
import SiteFooter from "./_components/site-footer";

export const metadata: Metadata = {
  title: "DEXION Pro - Cryptocurrency Trading Platform",
};
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* <TokenRefresher /> */}
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
              {/* <SiteHeader /> */}
              <main className="flex-1">
                <ClientQueryProvider>{children}</ClientQueryProvider>
              </main>
              <SiteFooter />
            </div>
          </PresetsContextProvider>
          {/* </WalletTrackerSocketProvider> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
