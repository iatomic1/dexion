import { TOKEN_WATCHER_API_BASE_URL } from "@repo/shared-constants/constants.ts";
import { TokenMetadata } from "@repo/token-watcher/token.ts";
import { TokenPoints, TokenLockedLiquidity } from "~/types/stxwatch";

export const getBatchTokenData = async (contract_ids: string[]) => {
  try {
    const url = `${TOKEN_WATCHER_API_BASE_URL}get_batch_token_data`;
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ contract_ids: contract_ids }),
    });

    if (!res.ok) throw new Error(`Failed: ${res.status}`);

    const data = (await res.json()) as TokenMetadata[];
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSearchResults = async (searchTerm: string) => {
  try {
    const url = `${TOKEN_WATCHER_API_BASE_URL}search?searchTerm=${searchTerm}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`Failed: ${res.status}`);

    const data = (await res.json()) as { tokens: TokenMetadata[] };
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPoints = async (ca: string) => {
  try {
    const url = `${TOKEN_WATCHER_API_BASE_URL}get_latest_token_points_single/${ca}`;
    const res = await fetch(`${url}`);

    if (!res.ok) throw new Error(`Failed: ${res.status}`);

    const data = (await res.json()) as TokenPoints;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getLockedLiquidity = async (ca: string) => {
  try {
    const url = `${TOKEN_WATCHER_API_BASE_URL}get_batch_locked_liquidity/${ca}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`Failed: ${res.status}`);

    const data = (await res.json()) as TokenLockedLiquidity[];
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
