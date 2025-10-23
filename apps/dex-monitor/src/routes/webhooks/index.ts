import { Hono } from "hono";
import swaps from "./swaps";
import { bearerAuth } from "hono/bearer-auth";
import { config } from "@/config";

const webhooks = new Hono();
// TODO: UNCOMMENT LATER
// webhooks.use(
// 	"*",
// 	bearerAuth({
// 		verifyToken: async (token, c) => {
// 			return token === config.chainhookConsumerSecret;
// 		},
// 		invalidTokenMessage: "Invalid or missing token",
// 	}),
// );
webhooks.route("/swaps", swaps);

export default webhooks;
