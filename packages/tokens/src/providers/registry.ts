import { FakFunProvider } from "./fakfun";
import { StxCityProvider } from "./stxcity";
import { TeneroProvider } from "./tenero";
import type { ProviderSource, TokenProvider } from "./types";

const providers: Record<ProviderSource, TokenProvider> = {
	stxtools: new TeneroProvider(),
	stxcity: new StxCityProvider(),
	fakfun: new FakFunProvider(),
};

export function getProvider(source: ProviderSource): TokenProvider {
	return providers[source];
}
