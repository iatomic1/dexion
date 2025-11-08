import { NotifierClient } from "@dexion/notifier";
import {
	ADDRESSES,
	DOMAIN_NAME,
	RAILWAY_HEALTHCHECK_URL,
	VERCEL_FRONTEND_URL,
} from "@dexion/shared";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
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

		const extraOrigins = [
			"http://localhost:3001",
			VERCEL_FRONTEND_URL,
			RAILWAY_HEALTHCHECK_URL,
		];

		this.app.use(
			"/*",
			cors({
				origin: (origin, _c) => {
					if (!origin) return null;

					// Check extraOrigins first
					if (extraOrigins.includes(origin)) {
						return origin;
					}

					// Check domain-based origins
					try {
						const url = new URL(origin);
						if (
							url.hostname === DOMAIN_NAME ||
							url.hostname.endsWith("." + DOMAIN_NAME)
						) {
							return origin;
						}
					} catch (error) {
						return null;
					}

					return null;
				},
				credentials: true,
			}),
		);
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

		this.app.get("/healthz", async (c) => {
			try {
				const redisStatus = await redisClient.ping();
				if (redisStatus === "PONG") {
					return c.json({ status: "ok", redis: "ok" });
				}
				return c.json({ status: "error", redis: "fail" }, 503);
			} catch (e) {
				console.error("Health check failed", e);
				return c.json({ status: "error", redis: "fail" }, 503);
			}
		});

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
