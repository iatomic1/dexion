import { getStxcityBondingData } from "@repo/tokens/services";
import { transformToTokenMetadata } from "@repo/tokens/utils";
import axios from "axios";
import { Hono } from "hono";

const market = new Hono();

market.get("/btcstx", async (c) => {
  try {
    console.log("Fetching BTC/STX data...");
    const url =
      "https://api-3.xverse.app/v2/coins-market-data?ids=bitcoin,blockstack";
    const { data } = await axios.get(url);
    return c.json(data, 200);
  } catch (err) {
    console.log(err);
  }
});

market.get("pulse", async (c) => {
  try {
    const bondingData = await getStxcityBondingData();
    const completedRaw = bondingData?.completed?.slice(0, 12) ?? [];
    const trendingRaw = bondingData?.trending ?? [];

    const completedRawPromises = completedRaw.map(async (token) => {
      try {
        return transformToTokenMetadata(token);
      } catch (err: any) {
        console.error(
          `Failed to get metadata for ${token.token_contract}:`,
          err,
        );
        return { token: token.token_contract, error: err.message };
      }
    });

    const trendingRawPromises = trendingRaw.map(async (token) => {
      try {
        return transformToTokenMetadata(token);
      } catch (err: any) {
        console.error(
          `Failed to get metadata for ${token.token_contract}:`,
          err,
        );
        return { token: token.token_contract, error: err.message };
      }
    });

    const finalData = {
      completed: await Promise.all(completedRawPromises),
      trending: await Promise.all(trendingRawPromises),
    };

    return c.json(finalData, 200);
  } catch (err) {
    console.error(err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default market;
