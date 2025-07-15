"use client";
import type {
	LiquidityPool,
	TokenHolder,
	TokenMetadata,
	TokenSwapTransaction,
} from "@repo/tokens/types";
import { usePathname } from "next/navigation";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { getPartyKitSocket } from "~/lib/partykit-client";

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

// Split contexts by data domain
const MetadataContext = createContext<{
	data: TokenMetadata | null;
	isLoading: boolean;
}>({
	data: null,
	isLoading: true,
});

const TradesContext = createContext<{
	data: TokenSwapTransaction[];
	isLoading: boolean;
}>({
	data: [],
	isLoading: true,
});

const HoldersContext = createContext<{
	data: TokenHolder[];
	isLoading: boolean;
}>({
	data: [],
	isLoading: true,
});

const PoolsContext = createContext<{
	data: LiquidityPool[];
	isLoading: boolean;
}>({
	data: [],
	isLoading: true,
});

const DevTokensContext = createContext<{
	data: TokenMetadata[];
	isLoading: boolean;
}>({
	data: [],
	isLoading: true,
});

// Raw socket context (kept for compatibility)
const TokenSocketContext = createContext<TxPayload | null>(null);

// Custom hooks for accessing specific data
export const useTokenMetadata = () => useContext(MetadataContext);
export const useTokenTrades = () => useContext(TradesContext);
export const useTokenHolders = () => useContext(HoldersContext);
export const useTokenPools = () => useContext(PoolsContext);
export const useDevTokens = () => useContext(DevTokensContext);
export const useTokenSocket = () => useContext(TokenSocketContext);

// Backwards compatibility hook that combines all data
export const useTokenData = () => {
	const { data: tokenData, isLoading: isLoadingMetadata } = useTokenMetadata();
	const { data: tradesData, isLoading: isLoadingTrades } = useTokenTrades();
	const { data: holdersData, isLoading: isLoadingHolders } = useTokenHolders();
	const { data: poolsData, isLoading: isLoadingPools } = useTokenPools();
	const { data: devTokensData, isLoading: isDevTokensLoading } = useDevTokens();

	const tx = useTokenSocket();

	return {
		tx,
		tokenData,
		tradesData,
		holdersData,
		poolsData,
		isLoadingMetadata,
		isLoadingTrades,
		isLoadingHolders,
		isLoadingPools,
		devTokensData,
		isDevTokensLoading,
	};
};

export const TokenSocketProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [tx, setTx] = useState<TxPayload | null>(null);
	const [tokenData, setTokenData] = useState<TokenMetadata | null>(null);
	const [tradesData, setTradesData] = useState<TokenSwapTransaction[]>([]);
	const [holdersData, setHoldersData] = useState<TokenHolder[]>([]);
	const [poolsData, setPoolsData] = useState<LiquidityPool[]>([]);
	const [devTokensData, setDevTokensData] = useState<TokenMetadata[]>([]);
	const [isDevTokensLoading, setIsDevTokensLoading] = useState(true);
	const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
	const [isLoadingTrades, setIsLoadingTrades] = useState(true);
	const [isLoadingHolders, setIsLoadingHolders] = useState(true);
	const [isLoadingPools, setIsLoadingPools] = useState(true);

	const pathname = usePathname();

	const handleSocketMessage = useCallback((data: TxPayload, ca: string) => {
		if (data.contract !== ca) return;

		setTx(data);

		switch (data.type) {
			case "metadata":
				console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", data.tokenMetadata);
				if (data.tokenMetadata) {
					setTokenData(data.tokenMetadata);
					setIsLoadingMetadata(false);
				}
				break;
			case "trades":
				if (data.trades) {
					setTradesData(data.trades);
					setIsLoadingTrades(false);
				}
				break;
			case "holders":
				if (data.holders) {
					setHoldersData(data.holders);
					setIsLoadingHolders(false);
				}
				break;
			case "pools":
				if (data.pools) {
					setPoolsData(data.pools);
					setIsLoadingPools(false);
				}
				break;
			case "devTokens":
				if (data.devTokens) {
					setDevTokensData(data.devTokens);
					setIsDevTokensLoading(false);
				}
				break;
			case "error":
				console.error(`Socket error for ${ca}:`, data.error);
				// Set all loading states to false on error
				setIsLoadingMetadata(false);
				setIsLoadingTrades(false);
				setIsLoadingHolders(false);
				setIsLoadingPools(false);
				setIsDevTokensLoading(false);
				break;
		}
	}, []);

	useEffect(() => {
		const match = pathname?.match(/\/meme\/(.+)/);
		const ca = match?.[1];
		if (!ca) return;

		// Reset states when contract address changes
		setIsLoadingMetadata(true);
		setIsLoadingTrades(true);
		setIsLoadingHolders(true);
		setIsDevTokensLoading(true);
		setIsLoadingPools(true);

		const socket = getPartyKitSocket(ca);

		// Subscribe to the contract address
		socket.addEventListener("open", () => {
			socket.send(
				JSON.stringify({
					type: "subscribe",
					payload: { contractAddress: ca },
				}),
			);
		});

		// Handle incoming messages
		socket.addEventListener("message", (event) => {
			try {
				const data: TxPayload = JSON.parse(event.data);
				handleSocketMessage(data, ca);
			} catch (error) {
				console.error("Error parsing socket message:", error);
			}
		});

		// Handle connection errors
		socket.addEventListener("error", (error) => {
			console.error("PartyKit socket error:", error);
			// Set all loading states to false on connection error
			setIsLoadingMetadata(false);
			setIsLoadingTrades(false);
			setIsLoadingHolders(false);
			setIsLoadingPools(false);
			setIsDevTokensLoading(false);
		});

		// Cleanup on unmount or contract address change
		return () => {
			socket.close();
		};
	}, [pathname, handleSocketMessage]);

	// Memoize context values to prevent unnecessary rerenders
	const metadataValue = useMemo(
		() => ({
			data: tokenData,
			isLoading: isLoadingMetadata,
		}),
		[tokenData, isLoadingMetadata],
	);

	const tradesValue = useMemo(
		() => ({
			data: tradesData,
			isLoading: isLoadingTrades,
		}),
		[tradesData, isLoadingTrades],
	);

	const holdersValue = useMemo(
		() => ({
			data: holdersData,
			isLoading: isLoadingHolders,
		}),
		[holdersData, isLoadingHolders],
	);

	const poolsValue = useMemo(
		() => ({
			data: poolsData,
			isLoading: isLoadingPools,
		}),
		[poolsData, isLoadingPools],
	);

	const devTokensValue = useMemo(
		() => ({
			data: devTokensData,
			isLoading: isDevTokensLoading,
		}),
		[devTokensData, isDevTokensLoading],
	);

	return (
		<TokenSocketContext.Provider value={tx}>
			<MetadataContext.Provider value={metadataValue}>
				<TradesContext.Provider value={tradesValue}>
					<HoldersContext.Provider value={holdersValue}>
						<PoolsContext.Provider value={poolsValue}>
							<DevTokensContext.Provider value={devTokensValue}>
								{children}
							</DevTokensContext.Provider>
						</PoolsContext.Provider>
					</HoldersContext.Provider>
				</TradesContext.Provider>
			</MetadataContext.Provider>
		</TokenSocketContext.Provider>
	);
};
