import { TokenLockedLiquidity, TokenPoints } from "~/types/stxwatch";
import {
  STXWATCH_API_BASE_URL,
  TOKEN_WATCHER_API_BASE_URL,
} from "../constants";

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
