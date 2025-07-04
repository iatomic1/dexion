import { STX_TOOLS_API_BASE_URL } from "@repo/shared-constants/constants.ts";
import {
  ApiRes,
  FilterTokenSwapTransaction,
  TokenMetadata,
} from "@repo/tokens/types";

export const getTokenMetadata = async (
  ca: string,
): Promise<TokenMetadata | null> => {
  try {
    const response = await fetch(`/api/token/${ca}`);

    if (!response.ok) {
      throw new Error("Failed to fetch token metadata");
    }

    const data = await response.json();
    // console.log("called", data);
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getFilterTrades = async (address: string, poolId: string) => {
  try {
    const targetUrl = `${STX_TOOLS_API_BASE_URL}pools/${poolId}/swaps?page=0&size=50&sort=burn_block_time%2Cdesc&type=all&address=${address}`;

    const res = await fetch(`/api/proxy?url=${encodeURIComponent(targetUrl)}`, {
      method: "GET",
    });

    if (!res.ok) throw new Error(`Failed: ${res.status}`);

    const data = (await res.json()) as ApiRes<FilterTokenSwapTransaction[]>;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
