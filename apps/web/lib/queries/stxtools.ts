import { TokenMetadata } from "@repo/token-watcher/token.ts";

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
