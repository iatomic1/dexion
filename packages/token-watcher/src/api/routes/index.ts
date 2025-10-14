import { Hono } from "hono";
import market from "./market";
import tokens from "./tokens";
import wallets from "./wallets";
import zest from "./zest";

const api = new Hono();

api.route("/market", market);
api.route("/tokens", tokens);
api.route("/wallets", wallets);
api.route("/sbtc/zest", zest);

export default api;
