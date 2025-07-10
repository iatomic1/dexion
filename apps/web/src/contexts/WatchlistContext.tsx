"use client";

import type { TokenMetadata } from "@repo/tokens/types";
import {
	keepPreviousData,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	addToWatchlistAction,
	deleteWatchlistAction,
	getUserWatchlist,
} from "~/app/actions/watchlist-actions";
import { getBatchTokenData } from "~/lib/queries/token-watcher";
import type { UserWatchlist } from "~/types/wallets";

// Define the interface for tokens with watchlist ID
export interface TokenWithWatchlistId extends TokenMetadata {
	watchlistId?: string;
}

// Create separate contexts for data and actions to minimize re-renders
type WatchlistDataContextType = {
	watchlist: UserWatchlist[];
	tokens: TokenWithWatchlistId[];
	filteredTokens: TokenWithWatchlistId[];
	isLoading: boolean;
	isFetching: boolean;
	error: unknown;
	isEmpty: boolean;
	searchQuery: string;
};

type WatchlistActionsContextType = {
	addToWatchlist: (ca: string) => Promise<void>;
	removeFromWatchlist: (id: string) => Promise<void>;
	setSearchQuery: (query: string) => void;
	clearSearch: () => void;
	refetchWatchlist: () => Promise<void>;
};

// Create the contexts
const WatchlistDataContext = createContext<
	WatchlistDataContextType | undefined
>(undefined);
const WatchlistActionsContext = createContext<
	WatchlistActionsContextType | undefined
>(undefined);

// Custom hooks to use the context
export function useWatchlistData() {
	const context = useContext(WatchlistDataContext);
	if (context === undefined) {
		throw new Error("useWatchlistData must be used within a WatchlistProvider");
	}
	return context;
}

export function useWatchlistActions() {
	const context = useContext(WatchlistActionsContext);
	if (context === undefined) {
		throw new Error(
			"useWatchlistActions must be used within a WatchlistProvider",
		);
	}
	return context;
}

// Combined hook for convenience
export function useWatchlist() {
	return {
		...useWatchlistData(),
		...useWatchlistActions(),
	};
}

// Provider component
export function WatchlistProvider({ children }: { children: ReactNode }) {
	const [searchQuery, setSearchQuery] = useState("");
	const queryClient = useQueryClient();

	// Query for watchlist data
	const {
		data: watchlistData,
		isLoading: isWatchlistLoading,
		error: watchlistError,
		isFetching: isWatchlistFetching,
		refetch: refetchWatchlistQuery,
	} = useQuery({
		queryKey: ["watchlist"],
		queryFn: getUserWatchlist,
		refetchOnWindowFocus: true,
		placeholderData: keepPreviousData,
	});

	// Extract and memoize contract addresses
	const contractAddresses = useMemo(() => {
		if (!watchlistData?.data || !Array.isArray(watchlistData.data)) {
			return [];
		}
		return watchlistData.data
			.map((item: UserWatchlist) => item.ca)
			.filter(Boolean);
	}, [watchlistData?.data]);

	// Query for token data
	const {
		data: tokenData = [],
		isLoading: isTokensLoading,
		error: tokensError,
		isFetching: isTokensFetching,
	} = useQuery({
		queryKey: ["batch-tokens", contractAddresses],
		queryFn: () => getBatchTokenData(contractAddresses),
		enabled: contractAddresses.length > 0,
		staleTime: 60 * 5000, // 5 minutes
		placeholderData: keepPreviousData,
	});

	// Memoize the merged data to prevent unnecessary recalculations
	const { watchlist, tokens } = useMemo(() => {
		const watchlistItems = watchlistData?.data || [];

		// Create a map for quick lookups
		const watchlistMap = new Map(
			watchlistItems.map((item: UserWatchlist) => [item.ca, item.id]),
		);

		// Merge token data with watchlist IDs
		const mergedTokens = tokenData.map((token: TokenMetadata) => ({
			...token,
			watchlistId: watchlistMap.get(token.contract_id),
		}));

		return {
			watchlist: watchlistItems,
			tokens: mergedTokens,
		};
	}, [watchlistData?.data, tokenData]);

	// Filter tokens based on search query
	const filteredTokens = useMemo(() => {
		if (!searchQuery.trim()) return tokens;

		const query = searchQuery.toLowerCase();
		return tokens.filter(
			(token) =>
				token.name?.toLowerCase().includes(query) ||
				token.contract_id?.toLowerCase().includes(query) ||
				token.symbol?.toLowerCase().includes(query),
		);
	}, [tokens, searchQuery]);

	// Memoize action functions to prevent unnecessary re-renders
	const addToWatchlist = useCallback(
		async (ca: string) => {
			await addToWatchlistAction({ ca });
			queryClient.invalidateQueries({ queryKey: ["watchlist"] });
		},
		[queryClient],
	);

	const removeFromWatchlist = useCallback(
		async (id: string) => {
			await deleteWatchlistAction({ id });
			queryClient.invalidateQueries({ queryKey: ["watchlist"] });
		},
		[queryClient],
	);

	const setSearchQueryCallback = useCallback((query: string) => {
		setSearchQuery(query);
	}, []);

	const clearSearch = useCallback(() => {
		setSearchQuery("");
	}, []);

	const refetchWatchlist = useCallback(async () => {
		await refetchWatchlistQuery();
	}, [refetchWatchlistQuery]);

	// Memoize data object to prevent unnecessary re-renders
	const dataValue = useMemo(
		() => ({
			watchlist,
			tokens,
			filteredTokens,
			isLoading: isWatchlistLoading || isTokensLoading,
			isFetching: isWatchlistFetching || isTokensFetching,
			error: watchlistError || tokensError,
			isEmpty: !watchlist.length,
			searchQuery,
		}),
		[
			watchlist,
			tokens,
			filteredTokens,
			isWatchlistLoading,
			isTokensLoading,
			isWatchlistFetching,
			isTokensFetching,
			watchlistError,
			tokensError,
			searchQuery,
		],
	);

	// Memoize actions object to prevent unnecessary re-renders
	const actionsValue = useMemo(
		() => ({
			addToWatchlist,
			removeFromWatchlist,
			setSearchQuery: setSearchQueryCallback,
			clearSearch,
			refetchWatchlist,
		}),
		[
			addToWatchlist,
			removeFromWatchlist,
			setSearchQueryCallback,
			clearSearch,
			refetchWatchlist,
		],
	);

	return (
		<WatchlistDataContext.Provider value={dataValue}>
			<WatchlistActionsContext.Provider value={actionsValue}>
				{children}
			</WatchlistActionsContext.Provider>
		</WatchlistDataContext.Provider>
	);
}
