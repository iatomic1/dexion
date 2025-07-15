import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getSearchResults } from "~/lib/queries/token-watcher";
import useDebounce from "./useDebounce";

interface UseSearchTokensOptions {
	searchTerm: string;
	debounceMs?: number;
	enabled?: boolean;
}

export const useSearchTokens = ({
	searchTerm,
	debounceMs = 300,
	enabled = true,
}: UseSearchTokensOptions) => {
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

	// Debounce the search term
	const [, cancelDebounce] = useDebounce(
		() => {
			setDebouncedSearchTerm(searchTerm);
		},
		debounceMs,
		[searchTerm],
	);

	// Clear debounced term immediately when search term becomes empty
	useEffect(() => {
		if (!searchTerm.trim()) {
			setDebouncedSearchTerm("");
			cancelDebounce();
		}
	}, [searchTerm, cancelDebounce]);

	const isSearching = debouncedSearchTerm.trim().length > 0;

	// Query for search results
	const searchQuery = useQuery({
		queryKey: ["search-tokens", debouncedSearchTerm],
		queryFn: () => getSearchResults(debouncedSearchTerm),
		enabled: enabled && isSearching,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});

	// Determine which query to use
	const activeQuery = searchQuery;

	return {
		data: activeQuery.data?.tokens || [],
		isLoading: activeQuery.isLoading,
		isError: activeQuery.isError,
		error: activeQuery.error,
		isSearching,
		// Additional useful states
		isSearchLoading: searchQuery.isLoading,
		isHistoryLoading: false,
		refetch: activeQuery.refetch,
	};
};
