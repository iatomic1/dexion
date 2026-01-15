import { normalRedisConnection as redis } from "@/config/connections";
import { logger } from "@/config/logger";
import type { HodlmmAlert } from "./hodlmm-alert";

export class HodlmmAlertStore {
	/**
	 * Scans all keys matching `hodlmm_alert:*` to find all alerts.
	 * NOTE: This is inefficient for large datasets. In production, we should maintain a SET of all alert IDs.
	 * For now, we'll scan or use the existing backend behavior if we index by user/pool.
	 *
	 * Since the Cron job needs to process ALL users, we might need a set `all_hodlmm_alerts` or `all_hodlmm_users`.
	 *
	 * Optimization: The backend service doesn't seem to maintain a global "all alerts" list in Redis.
	 * We can either:
	 * 1. Modify backend to maintain a `hodlmm:active_alerts` set.
	 * 2. Use `SCAN` here (acceptable for < 10k alerts).
	 *
	 * Let's assume we use SCAN for now to avoid modifying backend architecture too much,
	 * but we'll filter for active ones.
	 */
	public async getAllActiveAlerts(): Promise<HodlmmAlert[]> {
		const stream = redis.scanStream({
			match: "hodlmm_alert:*",
			count: 100,
		});

		const alerts: HodlmmAlert[] = [];

		for await (const keys of stream) {
			if (keys.length === 0) continue;

			const pipeline = redis.pipeline();
			for (const key of keys) {
				pipeline.hgetall(key);
			}

			const results = await pipeline.exec();
			if (!results) continue;

			for (const [err, data] of results) {
				if (err || !data || Object.keys(data).length === 0) continue;

				const raw = data as any;
				if (raw.status !== "active") continue;

				alerts.push({
					id: raw.id,
					userId: raw.userId,
					stacksAddress: raw.stacksAddress,
					poolId: raw.poolId,
					poolContract: raw.poolContract,
					displayName: raw.displayName,
					type: raw.type as "hodlmm",
					status: raw.status,
					lastKnownStatus: raw.lastKnownStatus,
					notifyViaWebapp: raw.notifyViaWebapp === "true",
					notifyViaTelegram: raw.notifyViaTelegram === "true",
					notifyViaEmail: raw.notifyViaEmail === "true",
					notifyViaWebhook: raw.notifyViaWebhook === "true",
					notifyOnOutOfRange: raw.notifyOnOutOfRange === "true",
					notifyOnBackInRange: raw.notifyOnBackInRange === "true",
					updatedAt: raw.updatedAt,
					createdAt: raw.createdAt,
				});
			}
		}

		logger.info({ count: alerts.length }, "Fetched all active HODLMM alerts");
		return alerts;
	}
}
