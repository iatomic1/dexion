import { Redis } from "ioredis";

export const REDIS_PREFIX = "auth-";

export interface SecondaryStorage {
	get: (key: string) => Promise<string | null>;
	set: (key: string, value: string, ttl?: number) => Promise<void>;
	delete: (key: string) => Promise<void>;
}

const authUrl = process.env.REDIS_AUTH_URL;
if (!authUrl) throw new Error("REDIS_AUTH_URL is not defined");

const cacheUrl = process.env.REDIS_CACHE_URL;
if (!cacheUrl) throw new Error("REDIS_CACHE_URL is not defined");

const authRedis = new Redis(authUrl);
const cacheRedis = new Redis(cacheUrl);

authRedis.on("error", (err) => {
	console.error("Auth Redis Client Error", err);
});

cacheRedis.on("error", (err) => {
	console.error("Cache Redis Client Error", err);
});

export const redisStorage: SecondaryStorage = {
	get: async (key: string) => {
		const data = await authRedis.get(REDIS_PREFIX + key);
		return data ?? null;
	},
	set: async (key: string, value: string, ttl?: number) => {
		if (ttl) {
			await authRedis.set(REDIS_PREFIX + key, value, "EX", ttl);
		} else {
			await authRedis.set(REDIS_PREFIX + key, value);
		}
	},
	delete: async (key: string) => {
		await authRedis.del(REDIS_PREFIX + key);
	},
};

type CachedUserData = {
	email?: string;
	telegram_id?: string;
};

export async function updateCachedUserField(
	userId: string,
	field: keyof CachedUserData,
	value: string,
) {
	if (!userId || !field) return;

	const key = `user:${userId}`;
	await cacheRedis.hset(key, field, value);
}

export async function getCachedUserData(
	userId: string,
): Promise<CachedUserData | null> {
	if (!userId) return null;

	const key = `user:${userId}`;
	const data = await cacheRedis.hgetall(key);

	if (Object.keys(data).length === 0) return null;

	return data as CachedUserData;
}
