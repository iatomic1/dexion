import { HonoAdapter } from "@bull-board/hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { config } from "@/config";
import { setupBullBoard } from "@/config/bullmq";
import emailWorker from "@/workers/email-worker";
import swapEventsWorker from "@/workers/swap-events-worker";
import telegramWorker from "@/workers/telegram-worker";
import webhookWorker from "@/workers/webhook-worker";
import health from "./health";
import webhooks from "./webhooks";

export const createApp = () => {
	const app = new Hono();
	if (process.env.NODE_ENV === "production") app.use(logger());
	app.use(prettyJSON());
	if (!swapEventsWorker.isRunning()) swapEventsWorker.run();
	if (!emailWorker.isRunning()) emailWorker.run();
	if (!webhookWorker.isRunning()) webhookWorker.run();
	if (!telegramWorker.isRunning()) telegramWorker.run();

	const bullBoardServerAdapter = new HonoAdapter(serveStatic);
	bullBoardServerAdapter.setBasePath("/ui");

	const lll = setupBullBoard(bullBoardServerAdapter);

	app.use(
		"/ui/*",
		basicAuth({
			username: config.BULLBOARD_USERNAME,
			password: config.BULLBOARD_PASSWORD,
		}),
	);

	app.route("/ui", bullBoardServerAdapter.registerPlugin());

	app.route("/webhooks", webhooks);
	app.route("/", health);
	return app;
};
