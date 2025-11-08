import { Hono } from "hono";
import {
	bullMqRedisConnection,
	normalRedisConnection,
} from "@/config/connections";
import {
	emailQueue,
	swapQueue,
	telegramQueue,
	webhookQueue,
} from "@/infrastructure/bullmq/queues";

const healthCheck = new Hono();

const checkRedisConnection = async (redis: typeof normalRedisConnection) => {
	try {
		const ping = await redis.ping();
		return ping === "PONG";
	} catch (error) {
		return false;
	}
};

const checkBullMqQueues = async () => {
	const queues = [emailQueue, swapQueue, telegramQueue, webhookQueue];
	const results = await Promise.all(
		queues.map(async (queue) => {
			const client = await queue.client;
			return {
				name: queue.name,
				isReady: client.status === "ready",
			};
		}),
	);
	return results;
};

healthCheck.get("/healthz", async (c) => {
	const [bullMqRedis, normalRedis, bullMqQueues] = await Promise.all([
		checkRedisConnection(bullMqRedisConnection),
		checkRedisConnection(normalRedisConnection),
		checkBullMqQueues(),
	]);

	const healthy =
		bullMqRedis && normalRedis && bullMqQueues.every((q) => q.isReady);

	if (!healthy) {
		return c.json(
			{
				status: "error",
				details: {
					bullMqRedis,
					normalRedis,
					bullMqQueues,
				},
			},
			503,
		);
	}

	return c.json({
		status: "ok",
		details: {
			bullMqRedis,
			normalRedis,
			bullMqQueues,
		},
	});
});

export default healthCheck;
