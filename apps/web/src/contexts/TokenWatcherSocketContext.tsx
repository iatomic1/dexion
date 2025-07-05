"use client";

import type {
	LiquidityPool,
	TokenHolder,
	TokenMetadata,
	TokenSwapTransaction,
} from "@repo/tokens/types";
import { usePathname } from "next/navigation";
import usePartySocket from "partysocket/react";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

// Original TxPayload type for socket data
type TxPayload = {
	type: string;
	contract: string;
	txId?: string;
	tokenMetadata?: TokenMetadata;
	trades?: TokenSwapTransaction[];
	holders?: TokenHolder[];
	pools?: LiquidityPool[];
	devTokens?: TokenMetadata[];
	error?: string;
};

// Combined context for all token data
type TokenDataContextType = {
	// Data
	metadata: TokenMetadata | null;
	trades: TokenSwapTransaction[];
	holders: TokenHolder[];
	pools: LiquidityPool[];
	devTokens: TokenMetadata[];

	// Loading states
	isLoadingMetadata: boolean;
	isLoadingTrades: boolean;
	isLoadingHolders: boolean;
	isLoadingPools: boolean;
	isLoadingDevTokens: boolean;

	// Raw socket data (for compatibility)
	lastMessage: TxPayload | null;
};

const TokenDataContext = createContext<TokenDataContextType>({
	metadata: null,
	trades: [],
	holders: [],
	pools: [],
	devTokens: [],
	isLoadingMetadata: true,
	isLoadingTrades: true,
	isLoadingHolders: true,
	isLoadingPools: true,
	isLoadingDevTokens: true,
	lastMessage: null,
});

// Custom hooks for accessing specific data
export const useTokenMetadata = () => {
	const context = useContext(TokenDataContext);
	return {
		data: context.metadata,
		isLoading: context.isLoadingMetadata,
	};
};

export const useTokenTrades = () => {
	const context = useContext(TokenDataContext);
	return {
		data: context.trades,
		isLoading: context.isLoadingTrades,
	};
};

export const useTokenHolders = () => {
	const context = useContext(TokenDataContext);
	return {
		data: context.holders,
		isLoading: context.isLoadingHolders,
	};
};

export const useTokenPools = () => {
	const context = useContext(TokenDataContext);
	return {
		data: context.pools,
		isLoading: context.isLoadingPools,
	};
};

export const useDevTokens = () => {
	const context = useContext(TokenDataContext);
	return {
		data: context.devTokens,
		isLoading: context.isLoadingDevTokens,
	};
};

export const useTokenSocket = () => {
	const context = useContext(TokenDataContext);
	return context.lastMessage;
};

// Backwards compatibility hook that combines all data
export const useTokenData = () => {
	const context = useContext(TokenDataContext);
	return {
		tx: context.lastMessage,
		tokenData: context.metadata,
		tradesData: context.trades,
		holdersData: context.holders,
		poolsData: context.pools,
		devTokensData: context.devTokens,
		isLoadingMetadata: context.isLoadingMetadata,
		isLoadingTrades: context.isLoadingTrades,
		isLoadingHolders: context.isLoadingHolders,
		isLoadingPools: context.isLoadingPools,
		isDevTokensLoading: context.isLoadingDevTokens,
	};
};

export const TokenSocketProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
	const [trades, setTrades] = useState<TokenSwapTransaction[]>([]);
	const [holders, setHolders] = useState<TokenHolder[]>([]);
	const [pools, setPools] = useState<LiquidityPool[]>([]);
	const [devTokens, setDevTokens] = useState<TokenMetadata[]>([]);
	const [lastMessage, setLastMessage] = useState<TxPayload | null>(null);

	const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
	const [isLoadingTrades, setIsLoadingTrades] = useState(true);
	const [isLoadingHolders, setIsLoadingHolders] = useState(true);
	const [isLoadingPools, setIsLoadingPools] = useState(true);
	const [isLoadingDevTokens, setIsLoadingDevTokens] = useState(true);

	const pathname = usePathname();

	// Extract contract address from pathname
	const contractAddress = useMemo(() => {
		const match = pathname?.match(/\/meme\/(.+)/);
		return match?.[1] || null;
	}, [pathname]);

	const handleSocketMessage = useCallback(
		(data: TxPayload) => {
			if (!contractAddress || data.contract !== contractAddress) return;

			setLastMessage(data);

			switch (data.type) {
				case "metadata":
					console.log("!!!!", JSON.stringify(data.tokenMetadata, null, 2));
					if (data.tokenMetadata) {
						setMetadata(data.tokenMetadata);
						setIsLoadingMetadata(false);
					}
					break;
				case "trades":
					if (data.trades) {
						setTrades(data.trades);
						setIsLoadingTrades(false);
					}
					break;
				case "holders":
					if (data.holders) {
						setHolders(data.holders);
						setIsLoadingHolders(false);
					}
					break;
				case "pools":
					if (data.pools) {
						setPools(data.pools);
						setIsLoadingPools(false);
					}
					break;
				case "devTokens":
					setDevTokens(
						data?.devTokens && data.devTokens.length > 0 ? data.devTokens : [],
					);
					setIsLoadingDevTokens(false);
					break;
				case "error":
					console.error(`Socket error for ${contractAddress}:`, data.error);
					// Set all loading states to false on error
					setIsLoadingMetadata(false);
					setIsLoadingTrades(false);
					setIsLoadingHolders(false);
					setIsLoadingPools(false);
					setIsLoadingDevTokens(false);
					break;
			}
		},
		[contractAddress],
	);

	// Reset loading states when contract address changes
	const resetLoadingStates = useCallback(() => {
		setIsLoadingMetadata(true);
		setIsLoadingTrades(true);
		setIsLoadingHolders(true);
		setIsLoadingPools(true);
		setIsLoadingDevTokens(true);
		setMetadata(null);
		setTrades([]);
		setHolders([]);
		setPools([]);
		setDevTokens([]);
		setLastMessage(null);
	}, []);

	// Use the PartySocket React hook
	const ws = usePartySocket({
		host: "localhost:1999",
		room: contractAddress ? `token:${contractAddress}` : "",
		onOpen() {
			console.log("PartySocket connected");
			if (contractAddress) {
				// Send subscription message when socket opens
				ws?.send(
					JSON.stringify({
						type: "subscribe",
						payload: { contractAddress },
					}),
				);
			}
		},
		onMessage(event) {
			try {
				const data: TxPayload = JSON.parse(event.data);
				handleSocketMessage(data);
			} catch (error) {
				console.error("Error parsing socket message:", error);
			}
		},
		onClose() {
			console.log("PartySocket closed");
		},
		onError(error) {
			console.error("PartySocket error:", error);
			// Set all loading states to false on connection error
			setIsLoadingMetadata(false);
			setIsLoadingTrades(false);
			setIsLoadingHolders(false);
			setIsLoadingPools(false);
			setIsLoadingDevTokens(false);
		},
	});

	// Reset states when contract address changes
	useMemo(() => {
		if (contractAddress) {
			resetLoadingStates();
		}
	}, [contractAddress, resetLoadingStates]);

	// Memoize the context value to prevent unnecessary rerenders
	const contextValue = useMemo(
		() => ({
			metadata,
			trades,
			holders,
			pools,
			devTokens,
			isLoadingMetadata,
			isLoadingTrades,
			isLoadingHolders,
			isLoadingPools,
			isLoadingDevTokens,
			lastMessage,
		}),
		[
			metadata,
			trades,
			holders,
			pools,
			devTokens,
			isLoadingMetadata,
			isLoadingTrades,
			isLoadingHolders,
			isLoadingPools,
			isLoadingDevTokens,
			lastMessage,
		],
	);

	// Don't render anything if there's no contract address
	if (!contractAddress) {
		return <>{children}</>;
	}

	return (
		<TokenDataContext.Provider value={contextValue}>
			{children}
		</TokenDataContext.Provider>
	);
};
