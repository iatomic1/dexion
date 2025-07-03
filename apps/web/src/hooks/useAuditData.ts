import { TokenMetadata } from "@repo/tokens/types";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getBalance } from "~/lib/queries/hiro";
import { getPoints, getLockedLiquidity } from "~/lib/queries/token-watcher";
import { getContractAddressAndName } from "~/lib/utils/contract";
import {
  getDevHoldingPercentage,
  getLockedLiquidityPercentage,
} from "~/lib/utils/token";
import { AddressBalanceResponse } from "~/types/hiro/balance";
import { TokenLockedLiquidity, TokenPoints } from "~/types/stxwatch";

export function useAuditData(ca: string, token: TokenMetadata) {
  const { data: pointsData, isLoading: isPointsLoading } =
    useQuery<TokenPoints>({
      queryKey: ["points", ca],
      queryFn: async () => getPoints(ca),
      enabled: !!ca,
    });

  const { data: lockedLiquidityData, isLoading: isLockedLiquidityLoading } =
    useQuery({
      queryKey: ["locked-liquidity", ca],
      queryFn: async () => getLockedLiquidity(ca),
      enabled: !!ca,
    });

  const { address } = getContractAddressAndName(ca);
  const { isLoading: isAddressBalanceLoading, data: addressBalanceData } =
    useQuery<AddressBalanceResponse>({
      queryKey: ["devHolding", ca?.split(".")[0]],
      queryFn: () => getBalance(address as string),
      enabled: address ? true : false,
    });

  const isLoading =
    isPointsLoading || isLockedLiquidityLoading || isAddressBalanceLoading;

  const [lockedLiquidityPercentage, setLockedLiquidityPercentage] =
    useState<number>(0);
  const [devHoldingPercentage, setDevHoldingPercentage] = useState<number>(0);

  useEffect(() => {
    if (lockedLiquidityData && lockedLiquidityData.length > 0) {
      const percentage = getLockedLiquidityPercentage(
        lockedLiquidityData[0] as TokenLockedLiquidity,
      );
      setLockedLiquidityPercentage(percentage);
    }
  }, [lockedLiquidityData]);

  useEffect(() => {
    if (addressBalanceData && addressBalanceData.fungible_tokens) {
      setDevHoldingPercentage(
        getDevHoldingPercentage(
          addressBalanceData as AddressBalanceResponse,
          token.contract_id,
          token.total_supply,
        ),
      );
    }
  }, [addressBalanceData]);

  return {
    totalPoints: pointsData && pointsData.total_points,
    lockedLiquidityPercentage,
    devHoldingPercentage,
    isLoading,
  };
}
