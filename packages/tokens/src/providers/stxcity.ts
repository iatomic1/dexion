import {
	getStxCityTokenMetadata,
	getStxCityTokenTrades,
	searchStxCity,
} from "../services/stxcity";
import type {
	ApiRes,
	LiquidityPool,
	TokenHolder,
	TokenMetadata,
	TokenSwapTransaction,
} from "../types";
import { transformStxCityToTokenMetadata } from "../utils/transferToTokenMetadata";
import { validateContractAddress } from "../utils";
import type { ProviderSource, TokenProvider } from "./types";

export class StxCityProvider implements TokenProvider {
	readonly source: ProviderSource = "stxcity";

	async getTokenMetadata(contractId: string): Promise<TokenMetadata | null> {
		const raw = await getStxCityTokenMetadata(contractId, true);
		return raw ? transformStxCityToTokenMetadata(raw) : null;
	}

	// stxcity has no dedicated holders endpoint for bonding-curve tokens.
	async getHolders(): Promise<ApiRes<TokenHolder> | null> {
		return null;
	}

	async search(term: string): Promise<TokenMetadata[] | null> {
		let isContract = false;
		try {
			isContract = validateContractAddress(term);
		} catch {
			isContract = false;
		}

		const raw = await searchStxCity(term, isContract);
		if (!Array.isArray(raw)) return null;

		return raw.map(transformStxCityToTokenMetadata);
	}

	async getTrades(
		contractId: string,
	): Promise<ApiRes<TokenSwapTransaction> | null> {
		const metadata = await getStxCityTokenMetadata(contractId, true);
		if (!metadata?.dex_contract) return null;

		const data = await getStxCityTokenTrades(
			metadata.dex_contract,
			contractId,
		);
		return data ?? null;
	}

	// stxcity has no per-token pool listing; pools only exist post-graduation,
	// where the token is served by Tenero instead.
	async getPools(): Promise<LiquidityPool[] | null> {
		return null;
	}
}
