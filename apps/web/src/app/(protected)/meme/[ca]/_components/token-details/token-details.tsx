"use client";

import type { TokenMetadata } from "@repo/tokens/types";
import { useIsMobile } from "@repo/ui/hooks/use-is-mobile";
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
import { Session } from "~/types/auth";
import TokenInfoSkeleton from "../skeleton/token-info-skeleton";
import DesktopLayout from "./desktop-layout";
import MobileLayout from "./mobile-layout";

export default function TokenDetailPage({
	session,
	bitflowTokenId,
}: {
	session: Session;
	bitflowTokenId: string | null;
}) {
	const { data: tokenData, isLoading: isLoadingMetadata } = useTokenMetadata();
	const isMobile = useIsMobile();
	useEffect(() => {
		console.log("mobile", tokenData);
	}, [isLoadingMetadata]);

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

	const filterHandlers = useMemo(
		() => ({
			handleFilterChange,
			handleToggleFilter,
			filterBy,
		}),
		[handleFilterChange, handleToggleFilter, filterBy],
	);

	return (
		<Suspense fallback={<TokenInfoSkeleton />}>
			{isMobile ? (
				<MobileLayoutComponent
					tokenData={tokenData}
					filterHandlers={filterHandlers}
					isLoadingMetadata={isLoadingMetadata}
					userAddress={session?.user.walletAddress ?? null}
					bitflowTokenId={bitflowTokenId}
				/>
			) : (
				<DesktopLayoutComponent
					tokenData={tokenData}
					userAddress={session?.user.walletAddress ?? null}
					bitflowTokenId={bitflowTokenId}
				/>
			)}
		</Suspense>
	);
}

const MobileLayoutComponent = memo(
	({
		tokenData,
		filterHandlers,
		userAddress,
		isLoadingMetadata,
		bitflowTokenId,
	}: {
		tokenData: TokenMetadata | null;
		userAddress: string | null;
		isLoadingMetadata: boolean;
		bitflowTokenId: string | null;
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
				userAddress={userAddress ?? null}
				bitflowTokenId={bitflowTokenId}
			/>
		</Suspense>
	),
);

const DesktopLayoutComponent = memo(
	({
		tokenData,
		userAddress,
		bitflowTokenId,
	}: {
		tokenData: TokenMetadata | null;
		userAddress: string | null;
		bitflowTokenId: string | null;
	}) => (
		<DesktopLayout
			tokenData={tokenData}
			userAddress={userAddress}
			bitflowTokenId={bitflowTokenId}
		/>
	),
);

MobileLayoutComponent.displayName = "MobileLayoutComponent";
DesktopLayoutComponent.displayName = "DesktopLayoutComponent";
