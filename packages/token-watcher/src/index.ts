import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { createSocketIo } from "./services/socket-io";
import axios from "axios";
import { logger } from "hono/logger";
import { STX_WATCH_API_KEY, STXWATCH_API_BASE_URL } from "./lib/constants";
import { getTokenMetadata } from "./services/stxtools-api";

const PORT = process.env.PORT || 3008;
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

app.post("/get_batch_token_data", async (c) => {
  try {
    const body = await c.req.json();
    const contract_ids = body.contract_ids;

    if (!Array.isArray(contract_ids)) {
      return c.json({ error: "contract_ids must be an array" }, 400);
    }

    // Process all contracts in parallel
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

const server = serve(app);
const { io, emitTxToContractSubscribers } = createSocketIo(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
