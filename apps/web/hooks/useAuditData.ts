import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getLockedLiquidity, getPoints } from "~/lib/queries/stxwatch";
import { getLockedLiquidityPercentage } from "~/lib/utils/token";
import { TokenLockedLiquidity, TokenPoints } from "~/types/stxwatch";

export function useAuditData(ca: string) {
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

  const isLoading = isPointsLoading || isLockedLiquidityLoading;

  const [lockedLiquidityPercentage, setLockedLiquidityPercentage] =
    useState<number>(0);

  useEffect(() => {
    if (lockedLiquidityData && lockedLiquidityData.length > 0) {
      const percentage = getLockedLiquidityPercentage(
        lockedLiquidityData[0] as TokenLockedLiquidity,
      );
      setLockedLiquidityPercentage(percentage);
    }
  }, [lockedLiquidityData]);

  return {
    totalPoints: pointsData && pointsData.total_points,
    lockedLiquidityPercentage,
    isLoading,
  };
}
