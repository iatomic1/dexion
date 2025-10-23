import { Redis } from "ioredis";
import { config } from "./index";

export const bullMqRedisConnection = new Redis(config.bullMqRedisUrl, {
	maxRetriesPerRequest: null,
});
export const normalRedisConnection = new Redis(config.redisUrl);
