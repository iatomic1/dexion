// import "@repo/ui/globals.css";
import { TurnkeyProvider } from "@turnkey/sdk-react";
import "./globals.css";
import type React from "react";
import type { Metadata } from "next";
import { Toaster } from "@repo/ui/components/ui/sonner";
import { geistMono, geistSans } from "./fonts/geist";
import { PresetsContextProvider } from "~/contexts/PresetsContext";
import { DEV } from "~/lib/constants";
import { AuthProvider } from "~/components/providers/auth-providers";
import { ClientQueryProvider } from "~/components/providers/query-client-provider";
import { ThemeProvider } from "~/components/providers/theme-provider";
import { turnkeyConfig } from "~/config/turnkey";

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
        {/* <TokenRefresher /> */}
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
              {!DEV && (
                <div className="flex w-full items-center justify-center text-center text-sm py-3 text-destructive">
                  This website is still actively in development.
                </div>
              )}

              <ClientQueryProvider>
                <main className="flex-1">
                  <AuthProvider>
                    <TurnkeyProvider config={turnkeyConfig}>
                      {children}
                    </TurnkeyProvider>
                  </AuthProvider>
                </main>
              </ClientQueryProvider>
            </div>
          </PresetsContextProvider>
          {/* </WalletTrackerSocketProvider> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
