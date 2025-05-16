import { TokenLockedLiquidity, TokenPoints } from "~/types/stxwatch";
import { STXWATCH_API_BASE_URL } from "../constants";

export const getPoints = async (ca: string) => {
  try {
    const targetUrl = `${STXWATCH_API_BASE_URL}get_latest_token_points_single`;

    const res = await fetch(`/api/proxy?url=${encodeURIComponent(targetUrl)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_contract_id: ca }),
    });

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
    const targetUrl = `${STXWATCH_API_BASE_URL}get_batch_locked_liquidity`;
    const res = await fetch(`/api/proxy?url=${encodeURIComponent(targetUrl)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contract_ids: [ca] }),
    });

    if (!res.ok) throw new Error(`Failed: ${res.status}`);

    const data = (await res.json()) as TokenLockedLiquidity[];
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
