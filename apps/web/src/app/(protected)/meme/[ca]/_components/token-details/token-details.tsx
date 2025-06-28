"use client";

import { Suspense, useState, useCallback, useMemo } from "react";
import { useTokenMetadata } from "~/contexts/TokenWatcherSocketContext";
import useDocumentTitle from "~/hooks/useDocumentTitle";
import { formatPrice } from "~/lib/helpers/numbers";
import siteConfig from "~/config/site";
import { memo } from "react";
import TokenInfoSkeleton from "../skeleton/token-info-skeleton";
import DesktopLayout from "./desktop-layout";
import MobileLayout from "./mobile-layout";
import useMediaQuery from "~/hooks/useMediaQuery";
import { TokenMetadata } from "@repo/tokens/types";

interface TokenDetailPageProps {
  ca: string;
}

export default function TokenDetailPage({ ca }: TokenDetailPageProps) {
  const { data: tokenData, isLoading: isLoadingMetadata } = useTokenMetadata();
  const isMobile = useMediaQuery("(max-width: 640px)", {
    defaultValue: true, // Assume mobile-first
    initializeWithValue: true,
  });

  const documentTitle = useMemo(() => {
    if (!tokenData?.symbol || !tokenData?.metrics?.marketcap_usd) {
      return siteConfig.title;
    }
    return `${tokenData.symbol} $${formatPrice(tokenData.metrics.marketcap_usd)} | ${siteConfig.title}`;
  }, [tokenData?.symbol, tokenData?.metrics?.marketcap_usd]);

  useDocumentTitle(documentTitle);

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
        <DesktopLayout tokenData={tokenData} />
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
    <DesktopLayout tokenData={tokenData} />
  ),
);

MobileLayoutComponent.displayName = "MobileLayoutComponent";
DesktopLayoutComponent.displayName = "DesktopLayoutComponent";
