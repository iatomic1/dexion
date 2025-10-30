import { STX_TOOLS_API_BASE_URL } from "@dexion/shared";
import { validateStacksAddress } from "@stacks/transactions";
import { Hono } from "hono";

const wallets = new Hono();

wallets.get(":address", async (c) => {
	const address = c.req.param("address");

	if (!address) return c.json({ error: "Address is required" }, 400);
	if (!validateStacksAddress(address)) {
		return c.json({ error: "Invalid STX address" }, 422);
	}

	const url = `${STX_TOOLS_API_BASE_URL}wallets/${address}`;

	const res = await fetch(url);
	const data = await res.json();

	return c.json(data);
});
export default wallets;
