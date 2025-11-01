import { TokenMetadata } from "@dexion/tokens/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getBatchTokenData } from "~/lib/queries/token-watcher";

export function useAlertsTokenData(visibleAlerts: { ca: string }[]) {
	const caList = useMemo(() => {
		const uniqueCas = new Set(visibleAlerts.map((alert) => alert.ca));
		return Array.from(uniqueCas);
	}, [visibleAlerts]);

	const { data, isLoading, error } = useQuery({
		queryKey: ["alertsTokenData", caList],
		queryFn: () => getBatchTokenData(caList),
		enabled: caList.length > 0,
		staleTime: 30 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});

	const tokenDataMap = useMemo(() => {
		if (!data) return new Map<string, TokenMetadata>();
		return new Map(data.map((token) => [token.contract_id, token]));
	}, [data]);

	return {
		tokenDataMap,
		isLoading,
		error,
	};
}
