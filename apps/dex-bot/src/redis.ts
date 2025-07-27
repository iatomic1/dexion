import * as dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

const redisClient = createClient({
	url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

redisClient.connect().catch(console.error);

export default redisClient;
