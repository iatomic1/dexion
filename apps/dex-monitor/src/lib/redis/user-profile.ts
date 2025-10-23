import { normalRedisConnection } from "@/config/redis";

export type CachedUserProfile = {
	email?: string;
	telegram_id?: string;
};

export async function getCachedUserProfile(
	userId: string,
): Promise<CachedUserProfile | null> {
	if (!userId) return null;
	const data = await normalRedisConnection.hgetall(`user:${userId}`);
	return Object.keys(data).length ? (data as CachedUserProfile) : null;
}
