import { TokenMetadata } from "@dexion/tokens/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { getBatchTokenData } from "~/lib/queries/token-watcher";

type TokenResult = TokenMetadata | { error: unknown };

export function useAlertsTokenData(visibleAlerts: { ca: string }[]) {
	const caList = useMemo(() => {
		const uniqueCas = new Set(visibleAlerts.map((a) => a.ca));
		return Array.from(uniqueCas);
	}, [visibleAlerts]);

	const { data, isLoading, error } = useQuery<TokenResult[]>({
		queryKey: ["alertsTokenData", caList.sort().join(",")],
		queryFn: () => getBatchTokenData(caList),
		enabled: caList.length > 0,
		staleTime: 30 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		console.log("visible", visibleAlerts);
		console.log("token data", data);
	}, [data, visibleAlerts]);

	const tokenDataMap = useMemo(() => {
		if (!data) return new Map<string, TokenMetadata>();
		return new Map(
			data
				.filter((t): t is TokenMetadata => "contract_id" in t)
				.map((token) => [token.contract_id, token]),
		);
	}, [data]);

	return {
		tokenDataMap,
		isLoading,
		error,
	};
}
