import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import webhooks from "./webhooks";
import { setupBullBoard } from "@/config/bullmq";
import { serveStatic } from "@hono/node-server/serve-static";
import { HonoAdapter } from "@bull-board/hono";
import swapEventsWorker from "@/workers/swap-events-worker";
import emailWorker from "@/workers/email-worker";
import webhookWorker from "@/workers/webhook-worker";
import telegramWorker from "@/workers/telegram-worker";

export const createApp = () => {
	const app = new Hono();
	// app.use(logger());
	app.use(prettyJSON());
	if (!swapEventsWorker.isRunning()) swapEventsWorker.run();
	if (!emailWorker.isRunning()) emailWorker.run();
	if (!webhookWorker.isRunning()) webhookWorker.run();
	if (!telegramWorker.isRunning()) telegramWorker.run();

	const bullBoardServerAdapter = new HonoAdapter(serveStatic);
	bullBoardServerAdapter.setBasePath("/ui");

	const lll = setupBullBoard(bullBoardServerAdapter);
	app.route("/ui", bullBoardServerAdapter.registerPlugin());

	app.route("/webhooks", webhooks);
	return app;
};
