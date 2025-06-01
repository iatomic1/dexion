import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { createSocketIo } from "./services/socket-io";
import axios from "axios";
import { logger } from "hono/logger";

const PORT = process.env.PORT || 3008;
const app = new Hono();

app.use(logger());
app.use("/*", cors());

app.get("/tokens/:address", async (c) => {
  const address = c.req.param("address");
  return c.json({ address }, 200);
});

app.get("/btcstx", async (c) => {
  console.log("Fetching BTC/STX data...");
  const url =
    "https://api-3.xverse.app/v2/coins-market-data?ids=bitcoin,blockstack";
  const { data } = await axios.get(url);
  return c.json(data, 200);
});

const server = serve(app);
const { io, emitTxToContractSubscribers } = createSocketIo(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
