import { normalRedisConnection } from "@/config/redis";

export type CachedWebhookConfig = {
	id: string;
	userId: string;
	webhookUrl: string;
	bearerToken: string;
	enabled: boolean;
	status: string;
	updatedAt: string;
	createdAt: string;
};

export type CachedUserProfile = {
	email?: string;
	telegram_id?: string;
	webhook?: CachedWebhookConfig;
};

export async function getCachedUserProfile(
	userId: string,
): Promise<CachedUserProfile | null> {
	if (!userId) return null;

	const data = await normalRedisConnection.hgetall(`user:${userId}`);
	if (!Object.keys(data).length) return null;

	const profile: CachedUserProfile = {
		email: data.email,
		telegram_id: data.telegram_id,
	};

	if (data.webhook) {
		try {
			profile.webhook = JSON.parse(data.webhook) as CachedWebhookConfig;
		} catch {
			// corrupted or non-JSON value, ignore
		}
	}

	return profile;
}
