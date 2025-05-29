import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { createServer } from "http";
import { createSocketIo } from "./services/socket-io";

const PORT = process.env.PORT || 3008;
const app = new Hono();

app.use("/*", cors());

const server = createServer(serve(app));

const { io, emitTxToContractSubscribers } = createSocketIo(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/tokens/:address", async (c) => {
  const address = c.req.param("address");
});
