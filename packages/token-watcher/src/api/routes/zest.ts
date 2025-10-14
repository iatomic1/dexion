import { ZEST_API_BASE_URL } from "@repo/shared-constants/constants.ts";
import { Hono } from "hono";

const zest = new Hono();

const fetchProxy = async (url: string, c: any) => {
	try {
		const res = await fetch(url);
		if (!res.ok) {
			return c.json(
				{ error: `Upstream error ${res.status}`, details: await res.text() },
				res.status,
			);
		}
		const data = await res.json();
		return c.json(data);
	} catch (err) {
		console.error("Proxy error:", err);
		return c.json({ error: "Network or parsing error" }, 500);
	}
};

zest.get("/asset/reserve", (c) =>
	fetchProxy(`${ZEST_API_BASE_URL}/asset/reserve`, c),
);

zest.get("/:address/assets", (c) => {
	const address = c.req.param("address");
	return fetchProxy(`${ZEST_API_BASE_URL}/${address}/assets`, c);
});

zest.get("/:address/balances", (c) => {
	const address = c.req.param("address");
	return fetchProxy(`${ZEST_API_BASE_URL}/${address}/balances`, c);
});

zest.get("/asset/price", (c) =>
	fetchProxy(`${ZEST_API_BASE_URL}/asset/price`, c),
);

export default zest;
