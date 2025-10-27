import { Redis } from "ioredis";
import { User } from "~/types/auth";

export const REDIS_PREFIX = "auth-";
export interface SecondaryStorage {
	get: (key: string) => Promise<string | null>;
	set: (key: string, value: string, ttl?: number) => Promise<void>;
	delete: (key: string) => Promise<void>;
}

const url = process.env.REDIS_URL;
if (!url) throw new Error("REDIS_URL is not defined");

const redisClient = new Redis(url);

redisClient.on("error", (err) => {
	console.error("Redis Client Error", err);
});

export const redisStorage: SecondaryStorage = {
	get: async (key: string) => {
		const data = await redisClient.get(REDIS_PREFIX + key);
		return data ?? null;
	},
	set: async (key: string, value: string, ttl?: number) => {
		if (ttl) {
			await redisClient.set(REDIS_PREFIX + key, value, "EX", ttl);
		} else {
			await redisClient.set(REDIS_PREFIX + key, value);
		}
	},
	delete: async (key: string) => {
		await redisClient.del(REDIS_PREFIX + key);
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
	await redisClient.hset(key, field, value);
}

export async function getCachedUserData(
	userId: string,
): Promise<CachedUserData | null> {
	if (!userId) return null;

	const key = `user:${userId}`;
	const data = await redisClient.hgetall(key);

	if (!data || Object.keys(data).length === 0) return null;

	return data as CachedUserData;
}
