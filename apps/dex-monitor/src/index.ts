import { serve } from "bun";
import { mkdir, writeFile } from "fs/promises";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { nanoid } from "nanoid";
import { join } from "path";

const app = new Hono();

app.post("/api/update", async (c) => {
  try {
    const body = await c.req.json();
    const id = nanoid(8);
    const dir = join(process.cwd(), "examples");
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
