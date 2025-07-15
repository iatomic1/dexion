import type { TokenMetadata } from "@repo/tokens/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getBalance } from "~/lib/queries/hiro";
import { getLockedLiquidity, getPoints } from "~/lib/queries/token-watcher";
import { getContractAddressAndName } from "~/lib/utils/contract";
import {
	getDevHoldingPercentage,
	getLockedLiquidityPercentage,
} from "~/lib/utils/token";
import type { AddressBalanceResponse } from "~/types/hiro/balance";
import type { TokenLockedLiquidity, TokenPoints } from "~/types/stxwatch";

export function useAuditData(ca: string, token: TokenMetadata) {
	const isStxtools = token.source === "stxtools";

	// Only fetch points and locked liquidity for stxtools tokens
	const { data: pointsData, isLoading: isPointsLoading } =
		useQuery<TokenPoints>({
			queryKey: ["points", ca],
			queryFn: async () => getPoints(ca),
			enabled: !!ca && isStxtools,
			placeholderData: keepPreviousData,
			refetchOnWindowFocus: false,
		});

	const { data: lockedLiquidityData, isLoading: isLockedLiquidityLoading } =
		useQuery({
			queryKey: ["locked-liquidity", ca],
			queryFn: async () => getLockedLiquidity(ca),
			enabled: !!ca && isStxtools,
			placeholderData: keepPreviousData,
			refetchOnWindowFocus: false,
		});

	const { address } = getContractAddressAndName(ca);
	const { isLoading: isAddressBalanceLoading, data: addressBalanceData } =
		useQuery<AddressBalanceResponse>({
			queryKey: ["devHolding", ca?.split(".")[0]],
			queryFn: () => getBalance(address as string),
			enabled: !!address,
		});

	// Granular loading states
	const loadingStates = {
		points: isPointsLoading,
		lockedLiquidity: isLockedLiquidityLoading,
		devHolding: isAddressBalanceLoading,
	};

	const [lockedLiquidityPercentage, setLockedLiquidityPercentage] =
		useState<number>(0);
	const [devHoldingPercentage, setDevHoldingPercentage] = useState<number>(0);

	useEffect(() => {
		if (isStxtools && lockedLiquidityData && lockedLiquidityData.length > 0) {
			const percentage = getLockedLiquidityPercentage(
				lockedLiquidityData[0] as TokenLockedLiquidity,
			);
			setLockedLiquidityPercentage(percentage);
		}
	}, [lockedLiquidityData, isStxtools]);

	useEffect(() => {
		if (addressBalanceData?.fungible_tokens) {
			setDevHoldingPercentage(
				getDevHoldingPercentage(
					addressBalanceData as AddressBalanceResponse,
					token.contract_id,
					token.total_supply,
				),
			);
		}
	}, [addressBalanceData, token.contract_id, token.total_supply]);

	return {
		totalPoints: isStxtools ? pointsData?.total_points : null,
		lockedLiquidityPercentage: isStxtools ? lockedLiquidityPercentage : 0,
		devHoldingPercentage,
		loadingStates,
		isStxtools,
	};
}
