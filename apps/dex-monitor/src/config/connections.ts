import { Redis } from "ioredis";
import { config } from "./index";

export const bullMqRedisConnection = new Redis(config.BULLMQ_REDIS_URL, {
	maxRetriesPerRequest: null,
});

export const normalRedisConnection = new Redis(config.REDIS_URL, {
	maxRetriesPerRequest: null,
});

normalRedisConnection.on("connect", () => {
	console.log("Redis connected");
});

normalRedisConnection.on("ready", () => {
	console.log("Redis ready");
});

normalRedisConnection.on("error", (err) => {
	console.error("Redis error", err);
});
