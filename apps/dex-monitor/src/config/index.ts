export const config = {
	port: Number(process.env.PORT || 4000),
	bullMqRedisUrl: process.env.BULLMQ_REDIS_URL || "redis://127.0.0.1:6379",
	redisUrl: process.env.REDIS_URL || "",
	chainhookConsumerSecret: process.env.CHAINHOOK_CONSUMER_SECRET,
};
