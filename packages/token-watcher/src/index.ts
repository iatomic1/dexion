import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { createSocketIo } from "./services/socket-io";
import axios from "axios";
import { logger } from "hono/logger";
import { STX_WATCH_API_KEY, STXWATCH_API_BASE_URL } from "./lib/constants";

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

const server = serve(app);
const { io, emitTxToContractSubscribers } = createSocketIo(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
