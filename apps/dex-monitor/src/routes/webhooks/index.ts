import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { config } from "@/config";
import swaps from "./swaps";

const webhooks = new Hono();
// TODO: UNCOMMENT LATER
webhooks.use(
	"*",
	bearerAuth({
		verifyToken: async (token, c) => {
			return token === config.CHAINHOOK_CONSUMER_SECRET;
		},
		invalidTokenMessage: "Invalid or missing token",
	}),
);
webhooks.route("/swaps", swaps);

export default webhooks;
