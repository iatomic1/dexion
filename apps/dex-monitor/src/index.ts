import { serve } from "bun";
import { readdirSync, readFileSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { nanoid } from "nanoid";
import path, { join } from "path";
import { extractSwapData } from "./utils";

const app = new Hono();

// const dir = path.join(process.cwd(), "examples");
// const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

// for (const file of files) {
// 	const filePath = path.join(dir, file);
// 	const json = JSON.parse(readFileSync(filePath, "utf8"));
// 	const data = extractSwapData(json);
// 	console.log(file, data);
// }

app.post("/api/update", async (c) => {
	try {
		const body = await c.req.json();
		const id = nanoid(8);
		const dir = join(process.cwd(), "examples2");
		const filePath = join(dir, `${id}.json`);

		await mkdir(dir, { recursive: true });
		await writeFile(filePath, JSON.stringify(body, null, 2), "utf-8");

		return c.json({ result: "success", id }, 200);
	} catch (err) {
		console.error(err);
		return c.json({ result: "error", message: "Failed to save file" }, 500);
	}
});

app.use(logger());
app.use(prettyJSON());

serve({
	fetch: app.fetch,
	port: 3002,
});
