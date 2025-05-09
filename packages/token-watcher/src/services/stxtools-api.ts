import axios from "axios";
import { STX_TOOLS_API_BASE_URL } from "../lib/constants";
import type { TokenMetadata } from "../types/token";

export const getTokenMetadata = async (
  ca: string,
): Promise<TokenMetadata | null> => {
  try {
    const url = `${STX_TOOLS_API_BASE_URL}tokens/${ca}`;
    const { data } = await axios.get(url);

    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};
