import * as dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const redisClient = new Redis(
	process.env.REDIS_CACHE_URL || "redis://localhost:6379",
);

redisClient.on("error", (err) => console.log("Redis Client Error", err));

export default redisClient;
