import { Hono } from "hono";
import market from "./market";
import tokens from "./tokens";
import wallets from "./wallets";

const api = new Hono();

api.route("/market", market);
api.route("/tokens", tokens);
api.route("/wallets", wallets);

export default api;
