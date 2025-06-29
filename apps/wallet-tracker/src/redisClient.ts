import Redis from "ioredis";

const redis = new Redis();

redis.on("error", (err) => {
  console.error("Redis Error:", err);
});

export default redis;
