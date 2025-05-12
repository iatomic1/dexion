import axios from "axios";
import { STX_TOOLS_API_BASE_URL } from "../lib/constants";
import type {
  TokenMetadata,
  ApiRes,
  TokenSwapTransaction,
  TokenHolder,
} from "../types/token";

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

export const getTrades = async (
  ca: string,
): Promise<ApiRes<TokenSwapTransaction> | null> => {
  try {
    const url = `${STX_TOOLS_API_BASE_URL}tokens/${ca}/swaps?page=0&size=50&type=all`;
    const { data } = await axios.get(url);

    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getHolders = async (
  ca: string,
): Promise<ApiRes<TokenHolder> | null> => {
  try {
    const url = `${STX_TOOLS_API_BASE_URL}tokens/${ca}/holders?page=0&size=50&sort=balance%2Cdesc`;
    const { data } = await axios.get(url);

    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};
