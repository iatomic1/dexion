import { TOKEN_WATCHER_API_BASE_URL } from "../constants";
import { TokenMetadata } from "@repo/token-watcher/token.ts";

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
