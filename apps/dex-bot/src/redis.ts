import { createClient } from "redis";
import * as dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

redisClient.connect().catch(console.error);

export default redisClient;
