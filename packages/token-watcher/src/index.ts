import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { logger } from "hono/logger";
import { STX_WATCH_API_KEY } from "./lib/env";
import {
  getSearch,
  getTokenMetadata,
  getStxcityBondingData,
  searchStxCity,
} from "@repo/tokens/services";
import {
  validateContractAddress,
  transformToTokenMetadata,
} from "@repo/tokens/utils";
import { STXWATCH_API_BASE_URL } from "@repo/shared-constants/constants.ts";
import axios from "axios";

const PORT = 3008;
const app = new Hono();

app.use(logger());
app.use("/*", cors());

app.get("/tokens/:address", async (c) => {
  const address = c.req.param("address");
  return c.json({ address }, 200);
});

app.get("/btcstx", async (c) => {
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

app.get("/get_latest_token_points_single/:ca", async (c) => {
  const ca = c.req.param("ca");
  const url = `${STXWATCH_API_BASE_URL}get_latest_token_points_single`;

  const { data } = await axios.post(
    url,
    {
      p_contract_id: ca,
    },
    {
      headers: {
        Authorization: `Bearer ${STX_WATCH_API_KEY}`,
        Apikey: STX_WATCH_API_KEY as string,
      },
    },
  );
  return c.json(data, 200);
});

app.get("/get_batch_locked_liquidity/:ca", async (c) => {
  const ca = c.req.param("ca");
  const url = `${STXWATCH_API_BASE_URL}get_batch_locked_liquidity`;

  const { data } = await axios.post(
    url,
    {
      contract_ids: [ca],
    },
    {
      headers: {
        Authorization: `Bearer ${STX_WATCH_API_KEY}`,
        Apikey: STX_WATCH_API_KEY as string,
      },
    },
  );
  return c.json(data, 200);
});

app.get("/search", async (c) => {
  const searchTerm = c.req.query("searchTerm");
  if (!searchTerm) return c.json({ error: "Missing searchTerm" }, 400);
  let isContract;
  try {
    isContract = validateContractAddress(searchTerm);
  } catch (err) {
    console.error(err);
    isContract = false;
  }
  try {
    const [stxtoolsTokens, stxcityRaw] = await Promise.all([
      getSearch(searchTerm),
      searchStxCity(searchTerm, isContract),
    ]);

    console.log(stxcityRaw);
    const stxcityTokens = (stxcityRaw || []).map(transformToTokenMetadata);
    const combined = [...(stxtoolsTokens || []), ...stxcityTokens];

    const tokenMap = new Map();

    combined.forEach((token) => {
      const id = token.contract_id;
      const existing = tokenMap.get(id);

      if (!existing) {
        // First token with this contract_id
        tokenMap.set(id, token);
      } else if (
        existing.platform === "stxcity" &&
        token.platform !== "stxcity"
      ) {
        // Replace stxcity token with non-stxcity token
        tokenMap.set(id, token);
      }
      // If existing is not stxcity, keep it (prefer non-stxcity over stxcity)
    });

    const filtered = Array.from(tokenMap.values());

    return c.json({ tokens: filtered });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

app.post("/get_batch_token_data", async (c) => {
  try {
    const body = await c.req.json();
    const contract_ids = body.contract_ids;

    if (!Array.isArray(contract_ids)) {
      return c.json({ error: "contract_ids must be an array" }, 400);
    }

    const tokenDataPromises = contract_ids.map(async (contractId) => {
      try {
        return await getTokenMetadata(contractId);
      } catch (error) {
        console.error(`Failed to get metadata for ${contractId}:`, error);
        return { contractId, error: error.message };
      }
    });

    const results = await Promise.all(tokenDataPromises);

    return c.json(results);
  } catch (error) {
    console.error("Error in get_batch_token_data:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/pulse", async (c) => {
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

const server = serve(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
