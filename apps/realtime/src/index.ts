import type { Server } from "bun";
import { Hono } from "hono";
import { startAlertTriggeredConsumer } from "./alert-trigerred-consumer";
import { config } from "./config";
import { logger } from "./config/logger";
import { conn } from "./rabbitmq-connection";
import { engine, pubClient } from "./socket-io";

const app = new Hono();
app.get("/healthz", async (c) => {
	let redisStatus = "down";
	let rabbitmqStatus = "down";

	try {
		if ((await pubClient.ping()) === "PONG") {
			redisStatus = "up";
		}
	} catch (err) {
		logger.error(err, "[Healthz] Redis ping failed");
	}

	try {
		if (conn) {
			const ch = await conn.createChannel();
			await ch.close();
			rabbitmqStatus = "up";
		}
	} catch (err) {
		logger.error(err, "[Healthz] RabbitMQ channel test failed");
	}
	const isHealthy = redisStatus === "up" && rabbitmqStatus === "up";

	return c.json(
		{
			status: isHealthy ? "ok" : "degraded",
			services: {
				redis: redisStatus,
				rabbitmqStatus: rabbitmqStatus,
			},
			uptime: process.uptime(),
			timestamp: new Date().toISOString(),
		},
		isHealthy ? 200 : 503,
	);
});
const { websocket } = engine.handler();
startAlertTriggeredConsumer();

export default {
	port: config.PORT,
	idleTimeout: 30,
	fetch(req: Request, server: Server<any>) {
		const url = new URL(req.url);
		if (url.pathname === "/socket.io/") {
			return engine.handleRequest(req, server);
		}
		return app.fetch(req, server);
	},
	websocket,
};
