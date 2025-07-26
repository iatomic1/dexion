"use client";

import type { TokenMetadata } from "@repo/tokens/types";
import { useIsMobile } from "@repo/ui/hooks/use-mobile";
import {
	memo,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import siteConfig from "~/config/site";
import { useTokenMetadata } from "~/contexts/TokenWatcherSocketContext";
import useDocumentTitle from "~/hooks/useDocumentTitle";
import useFavicon from "~/hooks/useFavicon";
import { formatPrice } from "~/lib/helpers/numbers";
import TokenInfoSkeleton from "../skeleton/token-info-skeleton";
import DesktopLayout from "./desktop-layout";
import MobileLayout from "./mobile-layout";

export default function TokenDetailPage() {
	const { data: tokenData, isLoading: isLoadingMetadata } = useTokenMetadata();
	const isMobile = useIsMobile();
	useEffect(() => {
		console.log("mobile", isMobile);
	}, [isMobile]);

	const documentTitle = useMemo(() => {
		if (!tokenData?.symbol || !tokenData?.metrics?.marketcap_usd) {
			return siteConfig.title;
		}
		return `${tokenData.symbol} $${formatPrice(tokenData.metrics.marketcap_usd)} | ${siteConfig.title}`;
	}, [tokenData?.symbol, tokenData?.metrics?.marketcap_usd]);

	const tokenImage = useMemo(() => {
		if (tokenData?.image_url) return tokenData?.image_url;
	}, [tokenData?.image_url]);

	useFavicon(tokenImage as string);
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
