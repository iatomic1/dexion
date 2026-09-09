import { fetchFakFunTokens, getFakFunTokenMetadata } from "../services/fakfun";
import type {
	ApiRes,
	LiquidityPool,
	TokenHolder,
	TokenMetadata,
	TokenSwapTransaction,
} from "../types";
import { transformFakFunToTokenMetadata } from "../utils/transferToTokenMetadata";
import { NotImplementedError, type ProviderSource, type TokenProvider } from "./types";

// fakfun is not being actively integrated right now - the site is largely
// dormant. getTokenMetadata/search wrap the pre-existing, working calls;
// everything else is stubbed so this slot is ready for a real integration
// later without another round of plumbing.
export class FakFunProvider implements TokenProvider {
	readonly source: ProviderSource = "fakfun";

	getTokenMetadata(contractId: string): Promise<TokenMetadata | null> {
		return getFakFunTokenMetadata(contractId);
	}

	async search(term: string): Promise<TokenMetadata[] | null> {
		const all = await fetchFakFunTokens();
		const needle = term.toLowerCase();

		const matches = all.filter(
			(token: any) =>
				token.name.toLowerCase().includes(needle) ||
				token.symbol.toLowerCase().includes(needle) ||
				token.tokenContract.toLowerCase().includes(needle),
		);

		return matches.map((raw: any) => {
			const source = raw.progress < 1 ? "fakfun" : "stxtools";
			return transformFakFunToTokenMetadata(raw, source);
		});
	}

	getHolders(): Promise<ApiRes<TokenHolder> | null> {
		throw new NotImplementedError("FakFunProvider", "getHolders");
	}

	getTrades(): Promise<ApiRes<TokenSwapTransaction> | null> {
		throw new NotImplementedError("FakFunProvider", "getTrades");
	}

	getPools(): Promise<LiquidityPool[] | null> {
		throw new NotImplementedError("FakFunProvider", "getPools");
	}
}
