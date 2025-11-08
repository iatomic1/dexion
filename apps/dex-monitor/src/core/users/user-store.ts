import { normalRedisConnection as redis } from "@/config/connections";
import type { CachedUserProfile, CachedWebhookConfig } from "@/core/users/user";

export class UserStore {
	public async getUserProfile(
		userId: string,
	): Promise<CachedUserProfile | null> {
		if (!userId) return null;

		const data = await redis.hgetall(`user:${userId}`);
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
}
