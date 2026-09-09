import type {
	ApiRes,
	LiquidityPool,
	TokenHolder,
	TokenMetadata,
	TokenSwapTransaction,
} from "../types";

// Wire-format identifier persisted in Redis (`source:<contractId>`) and consumed
// across hub/partykit/dex-monitor. Kept as "stxtools" even though the underlying
// provider is now Tenero, so existing stored values don't need a data migration.
export type ProviderSource = "stxtools" | "stxcity" | "fakfun";

export class NotImplementedError extends Error {
	constructor(provider: string, method: string) {
		super(`${provider} does not implement ${method}`);
		this.name = "NotImplementedError";
	}
}

export interface TokenProvider {
	readonly source: ProviderSource;
	getTokenMetadata(contractId: string): Promise<TokenMetadata | null>;
	getHolders(contractId: string): Promise<ApiRes<TokenHolder> | null>;
	search(term: string): Promise<TokenMetadata[] | null>;
	getTrades(contractId: string): Promise<ApiRes<TokenSwapTransaction> | null>;
	getPools(contractId: string): Promise<LiquidityPool[] | null>;
}
