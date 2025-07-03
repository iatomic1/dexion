import { Hono } from "hono";
import market from "./market";
import tokens from "./tokens";

const api = new Hono();

api.route("/market", market);
api.route("/tokens", tokens);

export default api;
