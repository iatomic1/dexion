import { serve } from "@hono/node-server";
import { NotifierClient } from "@repo/notifier";
import { ADDRESSES, FRONTEND_URL } from "@repo/shared-constants/constants.ts";
import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import routes from "./api/routes";
import { DexMonitor } from "./core/DexMonitor";
import { PriceAlertChecker } from "./core/PriceAlertChecker";
import { TransactionHandler } from "./core/TransactionHandler";
import { updateTokenSources } from "./jobs/update-sources";
import redisClient from "./services/redis";

export class TokenWatcherServer {
	private app: Hono;
	private notifier: NotifierClient;
	private dexMonitor: DexMonitor;
	private priceAlertChecker: PriceAlertChecker;

	constructor(private port: number) {
		this.app = new Hono();
		this.notifier = new NotifierClient();
		const transactionHandler = new TransactionHandler(redisClient);
		this.dexMonitor = new DexMonitor(
			transactionHandler,
			Object.values(ADDRESSES),
		);
		this.priceAlertChecker = new PriceAlertChecker(redisClient, this.notifier);
	}

	private setupMiddleware() {
		this.app.use(logger());

		this.app.use(
			"/*",
			cors({
				origin: ["http://localhost:3001", FRONTEND_URL],
			}),
		);

		// this.app.use("/*", async (c, next) => {
		// 	const path = c.req.path;
		// 	if (path === "/favicon.ico" || path.startsWith("/.git")) {
		// 		return c.text("Not found", 404);
		// 	}
		// 	return await next();
		// });
	}

	private setupRoutes() {
		this.app.get("/", (c) =>
			c.text("As you can see I am not dead.", 200, {
				"Content-Type": "text/plain",
			}),
		);
		this.app.get("/favicon.ico", (c) => c.notFound());

		this.app.get("/robots.txt", (c) =>
			c.text("User-agent: *\nDisallow: /", 200, {
				"Content-Type": "text/plain",
			}),
		);
		this.app.route("/", routes);
		this.app.all("*", (c) => c.notFound());
	}

	public async start() {
		this.setupMiddleware();
		this.setupRoutes();

		updateTokenSources(redisClient);
		setInterval(() => updateTokenSources(redisClient), 60 * 60 * 1000);

		this.dexMonitor.start();
		this.priceAlertChecker.start();

		serve({
			fetch: this.app.fetch,
			port: this.port,
		});

		console.log(`Server running on port ${this.port}`);
	}
}
