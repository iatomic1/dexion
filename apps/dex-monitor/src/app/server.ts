import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { HonoAdapter } from "@bull-board/hono";
import type { Logger } from "@dexion/logger";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { logger as honoLogger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { config } from "@/config";
import healthCheck from "@/features/health-check/http-entrypoint";
import swapIngestion from "@/features/swap-ingestion/http-entrypoint";
import {
	emailQueue,
	swapQueue,
	telegramQueue,
	webhookQueue,
} from "@/infrastructure/bullmq/queues";

export function createApp() {
	const app = new Hono();

	// Middleware
	if (process.env.NODE_ENV === "production") app.use(honoLogger());
	app.use(prettyJSON());

	// Bull Board UI
	const bullBoardServerAdapter = new HonoAdapter(serveStatic);
	bullBoardServerAdapter.setBasePath("/ui");
	createBullBoard({
		queues: [
			new BullMQAdapter(webhookQueue),
			new BullMQAdapter(emailQueue),
			new BullMQAdapter(swapQueue),
			new BullMQAdapter(telegramQueue),
		],
		options: {
			uiConfig: {
				boardTitle: "DexMonitor",
			},
		},
		serverAdapter: bullBoardServerAdapter,
	});
	app.use(
		"/ui/*",
		basicAuth({
			username: config.BULLBOARD_USERNAME,
			password: config.BULLBOARD_PASSWORD,
		}),
	);
	app.route("/ui", bullBoardServerAdapter.registerPlugin());

	// Register feature routes
	app.route("/", healthCheck);
	app.route("/webhooks/swaps", swapIngestion);

	return app;
}

export function startServer(logger: Logger) {
	const app = createApp();

	serve(
		{
			fetch: app.fetch,
			port: config.PORT,
		},
		({ port }) => {
			logger.info(`✅ Server running at http://localhost:${port}`);
			logger.info(`Bull Board UI available at http://localhost:${port}/ui`);
		},
	);
}
