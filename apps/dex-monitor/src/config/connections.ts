import { Redis } from "ioredis";
import { config } from "./index";

export const bullMqRedisConnection = new Redis(config.BULLMQ_REDIS_URL, {
	maxRetriesPerRequest: null,
});

export const appCacheRedisConnection = new Redis(config.REDIS_CACHE_URL, {
	maxRetriesPerRequest: null,
});

// export const authCacheRedisConnection = new Redis(config.REDIS_AUTH_URL, {
// 	maxRetriesPerRequest: null,
// });

appCacheRedisConnection.on("connect", () => {
	console.log("Redis connected");
});

appCacheRedisConnection.on("ready", () => {
	console.log("Redis ready");
});

appCacheRedisConnection.on("error", (err) => {
	console.error("Redis error", err);
});
