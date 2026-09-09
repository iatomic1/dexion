import {
	getHolders,
	getPools,
	getSearch,
	getTokenMetadata,
	getTrades,
} from "../services/stxtools-api";
import type {
	ApiRes,
	LiquidityPool,
	TokenHolder,
	TokenMetadata,
	TokenSwapTransaction,
} from "../types";
import type { ProviderSource, TokenProvider } from "./types";

// stxtools rebranded to Tenero; the wire-format `source` value stays "stxtools",
// see providers/types.ts.
export class TeneroProvider implements TokenProvider {
	readonly source: ProviderSource = "stxtools";

	getTokenMetadata(contractId: string): Promise<TokenMetadata | null> {
		return getTokenMetadata(contractId);
	}

	getHolders(contractId: string): Promise<ApiRes<TokenHolder> | null> {
		return getHolders(contractId);
	}

	search(term: string): Promise<TokenMetadata[] | null> {
		return getSearch(term);
	}

	getTrades(
		contractId: string,
	): Promise<ApiRes<TokenSwapTransaction> | null> {
		return getTrades(contractId);
	}

	getPools(contractId: string): Promise<LiquidityPool[] | null> {
		return getPools(contractId);
	}
}
