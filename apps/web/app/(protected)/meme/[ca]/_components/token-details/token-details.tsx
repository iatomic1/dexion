"use client";

import { lazy, Suspense, useState, useCallback, useMemo } from "react";
import { useTokenMetadata } from "~/contexts/TokenWatcherSocketContext";
import useDocumentTitle from "~/hooks/useDocumentTitle";
import { formatPrice } from "~/lib/helpers/numbers";
import siteConfig from "~/config/site";
import type { TokenMetadata } from "@repo/token-watcher/token.ts";
import { memo } from "react";
import TokenInfoSkeleton from "../skeleton/token-info-skeleton";
import { useMediaQuery } from "../trade-details";
import DesktopLayout from "./desktop-layout";
import MobileLayout from "./mobile-layout";

// Separate mobile and desktop components for better code splitting
// const MobileLayout = lazy(() => import("./mobile-layout"));
// const DesktopLayout = lazy(() => import("./desktop-layout"));

interface TokenDetailPageProps {
  ca: string;
}

export default function TokenDetailPage({ ca }: TokenDetailPageProps) {
  const { data: tokenData, isLoading: isLoadingMetadata } = useTokenMetadata();
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Memoize document title to prevent unnecessary updates
  const documentTitle = useMemo(() => {
    if (!tokenData?.symbol || !tokenData?.metrics?.marketcap_usd) {
      return siteConfig.title;
    }
    return `${tokenData.symbol} $${formatPrice(tokenData.metrics.marketcap_usd)} | ${siteConfig.title}`;
  }, [tokenData?.symbol, tokenData?.metrics?.marketcap_usd]);

  useDocumentTitle(documentTitle);

  // Memoized filter state management
  const [filterBy, setFilterBy] = useState("");

  const handleFilterChange = useCallback((newFilter: string) => {
    setFilterBy(newFilter);
  }, []);

  const handleToggleFilter = useCallback((value: string) => {
    setFilterBy((prevFilter) => (prevFilter === value ? "" : value));
  }, []);

  // Memoized filter handlers to prevent unnecessary re-renders
  const filterHandlers = useMemo(
    () => ({
      handleFilterChange,
      handleToggleFilter,
      filterBy,
    }),
    [handleFilterChange, handleToggleFilter, filterBy],
  );

  // Early return for loading state
  // if (isLoadingMetadata) {
  //   return (
  //     <div className="flex flex-col h-full">
  //       <TokenInfoSkeleton />
  //       <div className="flex-1 animate-pulse bg-muted/20" />
  //     </div>
  //   );
  // }

  // Conditional rendering - only render the layout we need
  return (
    <Suspense fallback={<TokenInfoSkeleton />}>
      {isMobile ? (
        <MobileLayoutComponent
          tokenData={tokenData}
          filterHandlers={filterHandlers}
          isLoadingMetadata={isLoadingMetadata}
        />
      ) : (
        <DesktopLayoutComponent tokenData={tokenData} />
      )}
    </Suspense>
  );
}

// Memoized mobile layout component
const MobileLayoutComponent = memo(
  ({
    tokenData,
    filterHandlers,
    isLoadingMetadata,
  }: {
    tokenData: TokenMetadata | null;
    isLoadingMetadata: boolean;
    filterHandlers: {
      handleFilterChange: (newFilter: string) => void;
      handleToggleFilter: (value: string) => void;
      filterBy: string;
    };
  }) => (
    <Suspense fallback={<div className="h-full animate-pulse bg-muted/20" />}>
      <MobileLayout
        tokenData={tokenData}
        filterHandlers={filterHandlers}
        isLoadingMetadata={isLoadingMetadata}
      />
    </Suspense>
  ),
);

// Memoized desktop layout component
const DesktopLayoutComponent = memo(
  ({ tokenData }: { tokenData: TokenMetadata | null }) => (
    <Suspense fallback={<div className="h-full animate-pulse bg-muted/20" />}>
      <DesktopLayout tokenData={tokenData} />
    </Suspense>
  ),
);

MobileLayoutComponent.displayName = "MobileLayoutComponent";
DesktopLayoutComponent.displayName = "DesktopLayoutComponent";
